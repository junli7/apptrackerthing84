import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Application, Essay, Tag, Outcome, ChecklistItem, EssayVersion } from './types';
import { INITIAL_APPLICATIONS, INITIAL_ESSAYS, INITIAL_TAGS } from './constants';
import Header from './components/Header';
import Controls from './components/Controls';
import ApplicationList from './components/ApplicationList';
import AddSchoolModal from './components/modals/AddSchoolModal';
import AddEssayModal from './components/modals/AddEssayModal';
import ManageTagsModal from './components/modals/ManageTagsModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import saveAs from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import EssayHistoryViewerModal from './components/modals/EssayHistoryViewerModal';
import ProgressTracker from './components/ProgressTracker';


const App: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedApps = localStorage.getItem('applications');
      const savedEssays = localStorage.getItem('essays');
      const savedTags = localStorage.getItem('tags');

      if (savedApps && savedEssays && savedTags) {
        setApplications(JSON.parse(savedApps));
        setEssays(JSON.parse(savedEssays));
        setTags(JSON.parse(savedTags));
      } else {
        setApplications(INITIAL_APPLICATIONS);
        setEssays(INITIAL_ESSAYS);
        setTags(INITIAL_TAGS);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Fallback to initial data if localStorage is corrupt
      setApplications(INITIAL_APPLICATIONS);
      setEssays(INITIAL_ESSAYS);
      setTags(INITIAL_TAGS);
    } finally {
        setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
        try {
            localStorage.setItem('applications', JSON.stringify(applications));
            localStorage.setItem('essays', JSON.stringify(essays));
            localStorage.setItem('tags', JSON.stringify(tags));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }
  }, [applications, essays, tags, isInitialLoad]);

  // State for UI
  const [isAddSchoolModalOpen, setAddSchoolModalOpen] = useState(false);
  const [isAddEssayModalOpen, setAddEssayModalOpen] = useState<string | null>(null);
  const [isManageTagsModalOpen, setManageTagsModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [sortBy, setSortBy] = useState<'deadline-asc' | 'schoolName-asc' | 'schoolName-desc' | 'doneness-asc' | 'doneness-desc'>('deadline-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [expandedAppIds, setExpandedAppIds] = useState<Set<string>>(new Set());
  const [expandedEssayIds, setExpandedEssayIds] = useState<Set<string>>(new Set());
  const [expandedSectionKeys, setExpandedSectionKeys] = useState<Record<string, Set<'checklist' | 'notes'>>>({});
  const [essayHistoryViewer, setEssayHistoryViewer] = useState<{ isOpen: boolean, version: EssayVersion | null }>({ isOpen: false, version: null });
  const [sortTrigger, setSortTrigger] = useState(0);

  const handleRefreshSort = useCallback(() => {
    setSortTrigger(c => c + 1);
  }, []);
  
  // Refs to stabilize sorting
  const sortedAppIdsRef = useRef<string[]>([]);
  const prevDependenciesRef = useRef({ sortBy, filterTagId, searchQuery, sortTrigger });

  const essaysByApplicationId = useMemo(() => {
    return essays.reduce((acc, essay) => {
      if (!acc[essay.applicationId]) {
        acc[essay.applicationId] = [];
      }
      acc[essay.applicationId].push(essay);
      acc[essay.applicationId].sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<string, Essay[]>);
  }, [essays]);
  
  const tagsById = useMemo(() => {
    return tags.reduce((acc, tag) => {
      acc[tag.id] = tag;
      return acc;
    }, {} as Record<string, Tag>);
  }, [tags]);
  
  const schoolTags = useMemo(() => tags.filter(t => t.type === 'school').sort((a, b) => a.name.localeCompare(b.name)), [tags]);
  const essayTags = useMemo(() => tags.filter(t => t.type === 'essay').sort((a, b) => a.name.localeCompare(b.name)), [tags]);


  const displayedApplications = useMemo(() => {
    // 1. Filter applications based on search and tag filters.
    let filtered = applications;

    if (filterTagId) {
      filtered = applications.filter(app => {
        const appEssays = essaysByApplicationId[app.id] || [];
        return appEssays.some(essay => essay.tagIds.includes(filterTagId));
      });
    }

    if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase().split(';').map(term => term.trim()).filter(Boolean);
        
        if (searchTerms.length > 0) {
            filtered = filtered.filter(app => {
              const appTags = (app.tagIds || []).map(id => tagsById[id]).filter(Boolean);
              const appEssays = essaysByApplicationId[app.id] || [];
    
              return searchTerms.every(term => {
                return (
                  app.schoolName.toLowerCase().includes(term) ||
                  app.notes.toLowerCase().includes(term) ||
                  app.outcome.toLowerCase().includes(term) ||
                  appTags.some(tag => tag.name.toLowerCase().includes(term)) ||
                  appEssays.some(essay => 
                    essay.prompt.toLowerCase().includes(term) ||
                    essay.text.toLowerCase().includes(term) ||
                    essay.tagIds.map(id => tagsById[id]).filter(Boolean).some(tag => tag.name.toLowerCase().includes(term))
                  )
                );
              });
            });
        }
    }
    
    // 2. Decide if a re-sort is needed.
    const sortCriteriaChanged =
      prevDependenciesRef.current.sortBy !== sortBy ||
      prevDependenciesRef.current.filterTagId !== filterTagId ||
      prevDependenciesRef.current.searchQuery !== searchQuery ||
      prevDependenciesRef.current.sortTrigger !== sortTrigger;
      
    const currentFilteredIds = new Set(filtered.map(app => app.id));
    const previousSortedIdsAreValid = 
      sortedAppIdsRef.current.length === currentFilteredIds.size &&
      sortedAppIdsRef.current.every(id => currentFilteredIds.has(id));

    if (sortCriteriaChanged || !previousSortedIdsAreValid) {
      // Re-sort is needed.
      const getCompletionPercentage = (app: Application) => {
          const appEssays = essaysByApplicationId[app.id] || [];
          const totalChecklistTasks = app.checklist.length;
          const completedChecklistTasks = app.checklist.filter(i => i.completed).length;
          const totalEssayTasks = appEssays.length;
          const completedEssayTasks = appEssays.filter(e => e.completed).length;
          const totalTasks = totalChecklistTasks + totalEssayTasks;
          const completedTasks = completedChecklistTasks + completedEssayTasks;
          if (totalTasks === 0) return -1;
          return (completedTasks / totalTasks) * 100;
      };

      const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'deadline-asc':
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          case 'schoolName-asc':
            return a.schoolName.localeCompare(b.schoolName);
          case 'schoolName-desc':
            return b.schoolName.localeCompare(a.schoolName);
          case 'doneness-asc': {
            const progressA = getCompletionPercentage(a);
            const progressB = getCompletionPercentage(b);
            if (progressA === -1) return 1;
            if (progressB === -1) return -1;
            return progressA - progressB;
          }
          case 'doneness-desc': {
            const progressA = getCompletionPercentage(a);
            const progressB = getCompletionPercentage(b);
            if (progressA === -1) return 1;
            if (progressB === -1) return -1;
            return progressB - progressA;
          }
          default:
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
      });
      
      // Update refs with the new stable order and criteria.
      sortedAppIdsRef.current = sorted.map(app => app.id);
      prevDependenciesRef.current = { sortBy, filterTagId, searchQuery, sortTrigger };
      
      return sorted;
    } else {
      // No re-sort needed. Maintain the previous order but use the latest data.
      const appsById = new Map(filtered.map(app => [app.id, app]));
      return sortedAppIdsRef.current.map(id => appsById.get(id)).filter((app): app is Application => !!app);
    }
  }, [applications, essaysByApplicationId, tagsById, filterTagId, searchQuery, sortBy, sortTrigger]);

  const sortAndFilterKey = useMemo(() => {
    return `${sortBy}-${filterTagId}-${searchQuery}`;
  }, [sortBy, filterTagId, searchQuery]);

  useEffect(() => {
    if (filterTagId) {
      const newExpanded = new Set<string>();
      displayedApplications.forEach(app => newExpanded.add(app.id));
      setExpandedAppIds(newExpanded);
    }
  }, [filterTagId, displayedApplications]);

  const handleToggleExpand = (appId: string) => {
    setExpandedAppIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };
  
  const handleToggleEssayExpand = (essayId: string) => {
     setExpandedEssayIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(essayId)) {
        newSet.delete(essayId);
      } else {
        newSet.add(essayId);
      }
      return newSet;
    });
  };

  const handleToggleSectionExpand = (appId: string, sectionKey: 'checklist' | 'notes') => {
    setExpandedSectionKeys(prev => {
        const appSections = new Set(prev[appId]);
        if (appSections.has(sectionKey)) {
            appSections.delete(sectionKey);
        } else {
            appSections.add(sectionKey);
        }
        return { ...prev, [appId]: appSections };
    });
  };

  const handleExpandAll = () => {
    const allAppIds = new Set(applications.map(app => app.id));
    const allEssayIds = new Set(essays.map(essay => essay.id));
    const newExpandedSections: Record<string, Set<'checklist' | 'notes'>> = {};
    applications.forEach(app => {
        newExpandedSections[app.id] = new Set(['checklist', 'notes']);
    });
    setExpandedAppIds(allAppIds);
    setExpandedEssayIds(allEssayIds);
    setExpandedSectionKeys(newExpandedSections);
  };

  const handleCollapseAll = () => {
    setExpandedAppIds(new Set());
    setExpandedEssayIds(new Set());
    setExpandedSectionKeys({});
  };
  
  const handleExpandAppContent = (appId: string) => {
    const appEssays = essaysByApplicationId[appId] || [];
    setExpandedEssayIds(prev => new Set([...prev, ...appEssays.map(e => e.id)]));
    setExpandedSectionKeys(prev => ({
      ...prev,
      [appId]: new Set(['checklist', 'notes']),
    }));
  };

  const handleCollapseAppContent = (appId: string) => {
    const appEssayIds = (essaysByApplicationId[appId] || []).map(e => e.id);
    setExpandedEssayIds(prev => {
      const newSet = new Set(prev);
      appEssayIds.forEach(id => newSet.delete(id));
      return newSet;
    });
    setExpandedSectionKeys(prev => {
      const newSections = { ...prev };
      delete newSections[appId];
      return newSections;
    });
  };


  const handleAddSchool = (schoolData: Omit<Application, 'id' | 'notes' | 'checklist'>) => {
    const newSchool: Application = {
      ...schoolData,
      id: crypto.randomUUID(),
      notes: '',
      checklist: [
        { id: crypto.randomUUID(), text: 'Rec Letters', completed: false },
        { id: crypto.randomUUID(), text: 'Common App', completed: false },
        { id: crypto.randomUUID(), text: 'Their portal', completed: false },
      ],
    };
    setApplications(prev => [...prev, newSchool]);
  };
  
  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
  };
  
  const handleDeleteApplication = (appId: string) => {
    setApplications(prev => prev.filter(app => app.id !== appId));
    setEssays(prev => prev.filter(essay => essay.applicationId !== appId));
  };

  const handleAddEssay = (newEssayData: Omit<Essay, 'id' | 'order' | 'history' | 'completed'>) => {
    const order = (essaysByApplicationId[newEssayData.applicationId] || []).length;
    const newEssay: Essay = {
      ...newEssayData,
      id: crypto.randomUUID(),
      order,
      history: [],
      completed: false,
    };
    setEssays(prev => [...prev, newEssay]);
  };
  
  const handleUpdateEssay = (updatedEssay: Essay) => {
    setEssays(prev => prev.map(e => (e.id === updatedEssay.id ? updatedEssay : e)));
  };

  const handleToggleEssayComplete = (essayId: string) => {
    setEssays(prev => prev.map(e => e.id === essayId ? { ...e, completed: !e.completed } : e));
  };

  const handleCommitEssayHistory = (essayId: string, currentText: string) => {
    const essayToCommit = essays.find(e => e.id === essayId);
    if (essayToCommit) {
        const newHistoryEntry: EssayVersion = {
            text: currentText, // Use the most up-to-date text passed from the component
            timestamp: new Date().toISOString(),
        };
        const newHistory = [newHistoryEntry, ...(essayToCommit.history || [])];
        // Also update the main text to ensure state is synchronized,
        // in case this commit happened before the autosave fired.
        setEssays(prev => prev.map(e => e.id === essayId ? { ...e, text: currentText, history: newHistory } : e));
    }
  };
  
  const handleDeleteEssay = (essayId: string) => {
    setEssays(prev => prev.filter(e => e.id !== essayId));
  };
  
  const handleReorderEssays = (applicationId: string, draggedEssayId: string, targetEssayId: string) => {
    const appEssays = [...(essaysByApplicationId[applicationId] || [])];
    const draggedIndex = appEssays.findIndex(e => e.id === draggedEssayId);
    const targetIndex = appEssays.findIndex(e => e.id === targetEssayId);

    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const [draggedItem] = appEssays.splice(draggedIndex, 1);
    appEssays.splice(targetIndex, 0, draggedItem);
    
    const updatedOrder = appEssays.map((essay, index) => ({ ...essay, order: index }));

    setEssays(prev => {
        const otherEssays = prev.filter(e => e.applicationId !== applicationId);
        return [...otherEssays, ...updatedOrder];
    });
  };


  const handleAddTask = (applicationId: string, text: string) => {
    const newTask: ChecklistItem = { id: crypto.randomUUID(), text, completed: false };
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, checklist: [...app.checklist, newTask] } 
        : app
    ));
  };

  const handleToggleTask = (applicationId: string, taskId: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, checklist: app.checklist.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task) } 
        : app
    ));
  };
  
  const handleDeleteTask = (applicationId: string, taskId: string) => {
     setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, checklist: app.checklist.filter(task => task.id !== taskId) } 
        : app
    ));
  };

  
  const handleAddTag = (name: string, color: string, type: 'school' | 'essay') => {
    const newTag: Tag = { id: crypto.randomUUID(), name, color, type };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };
  
  const handleUpdateTag = (updatedTag: Tag) => {
    setTags(prev => prev.map(t => t.id === updatedTag.id ? updatedTag : t));
  };
  
  const handleDeleteTag = (tagId: string) => {
     setTags(prev => prev.filter(t => t.id !== tagId));
     // Also remove from applications and essays
     setApplications(prev => prev.map(app => ({...app, tagIds: app.tagIds.filter(id => id !== tagId)})));
     setEssays(prev => prev.map(e => ({...e, tagIds: e.tagIds.filter(id => id !== tagId)})));
  };

  // Confirmation modal handlers
  const requestDeleteApplication = (appId: string, appName: string) => {
    setConfirmationModal({
      isOpen: true,
      title: `Delete Application?`,
      message: `Are you sure you want to delete "${appName}"? This will also delete all of its essays. This action cannot be undone.`,
      onConfirm: () => handleDeleteApplication(appId),
    });
  };

  const requestDeleteEssay = (essayId: string, essayPrompt: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Essay?',
      message: `Are you sure you want to delete the essay with prompt: "${essayPrompt.substring(0, 50)}..."? This action cannot be undone.`,
      onConfirm: () => handleDeleteEssay(essayId),
    });
  };

  const requestDeleteTask = (applicationId: string, taskId: string, taskText: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Task?',
      message: `Are you sure you want to delete the task: "${taskText}"?`,
      onConfirm: () => handleDeleteTask(applicationId, taskId),
    });
  };
  
  const requestDeleteTag = (tagId: string, tagName: string) => {
     setConfirmationModal({
      isOpen: true,
      title: 'Delete Tag?',
      message: `Are you sure you want to delete the tag "${tagName}"? It will be removed from all associated schools and essays.`,
      onConfirm: () => handleDeleteTag(tagId),
    });
  }
  
  const handleConfirmDelete = () => {
    confirmationModal.onConfirm();
    setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };
  
  const handleCancelDelete = () => {
    setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleExportToDocx = () => {
    const doc = new Document({
      // FIX: The 'sections' property expects an array of section objects ({ children: [...] }), not a flat array of Paragraphs.
      // Changed flatMap to map and returned a section object for each application.
      sections: displayedApplications.map(app => {
        const appTags = (app.tagIds || []).map(id => tagsById[id]).filter(Boolean);
        const appEssays = essaysByApplicationId[app.id] || [];
        const children = [
          new Paragraph({
            text: app.schoolName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
                new TextRun({ text: "Deadline: ", bold: true }),
                new TextRun(new Date(app.deadline + 'T00:00:00').toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                })),
            ],
          }),
           new Paragraph({
             children: [
                new TextRun({ text: "Tags: ", bold: true }),
                new TextRun(appTags.map(t => t.name).join(', ') || 'None'),
            ],
          }),
          new Paragraph({
            children: [
                new TextRun({ text: "Status: ", bold: true }),
                new TextRun(app.outcome),
            ],
          }),
          new Paragraph({
            text: "Checklist",
            heading: HeadingLevel.HEADING_2,
          }),
          ...app.checklist.map(item => new Paragraph({
            text: item.text,
            bullet: { level: 0 },
          })),
          new Paragraph({
            text: "Notes",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph(app.notes || '(No notes)'),
          ...appEssays.flatMap(essay => {
            const essayTags = essay.tagIds.map(id => tagsById[id]).filter(Boolean);
            return [
                new Paragraph({
                    text: essay.prompt,
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph(essay.text || '(No text written)'),
                 new Paragraph({
                    children: [
                        new TextRun({ text: "Essay Tags: ", bold: true }),
                        new TextRun(essayTags.map(t => t.name).join(', ') || 'None'),
                    ],
                }),
            ]
          }),
        ];
        return { children };
      }),
    });
    
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "College-Application-Tracker-Export.docx");
    });
  };

  const handleExportData = () => {
    const dataToExport = {
      applications,
      essays,
      tags,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, "college-app-tracker-data.json");
  };

  const handleImportData = () => {
    importFileRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);
        
        // Basic validation
        if (Array.isArray(importedData.applications) && Array.isArray(importedData.essays) && Array.isArray(importedData.tags)) {
            setConfirmationModal({
                isOpen: true,
                title: 'Import Data?',
                message: 'Are you sure you want to import this data? This will overwrite all your current application data. This action cannot be undone.',
                onConfirm: () => {
                    setApplications(importedData.applications);
                    setEssays(importedData.essays);
                    setTags(importedData.tags);
                    // Reset UI state
                    handleCollapseAll();
                }
            });
        } else {
          alert('Invalid data file format.');
        }
      } catch (err) {
        console.error("Failed to parse imported file:", err);
        alert('Failed to read or parse the selected file. Please ensure it is a valid JSON export.');
      } finally {
        // Reset the file input so the same file can be selected again
        if (event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const progressData = useMemo(() => {
    const visibleApplications = displayedApplications;
    const submittedApplicationsCount = visibleApplications.filter(app => app.outcome !== Outcome.IN_PROGRESS).length;
    
    const visibleEssays = visibleApplications.flatMap(app => essaysByApplicationId[app.id] || []);
    const completedEssaysCount = visibleEssays.filter(essay => essay.completed).length;

    return {
      submittedApplicationsCount,
      totalApplications: visibleApplications.length,
      completedEssaysCount,
      totalEssays: visibleEssays.length
    }
  }, [displayedApplications, essaysByApplicationId]);
  
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans">
      <Header 
        onAddSchool={() => setAddSchoolModalOpen(true)} 
        onOpenManageTags={() => setManageTagsModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Controls
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onRefreshSort={handleRefreshSort}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          essayTags={essayTags}
          filterTagId={filterTagId}
          onFilterTagIdChange={setFilterTagId}
          onOpenManageTags={() => setManageTagsModalOpen(true)}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onExportToDocx={handleExportToDocx}
          resultsCount={displayedApplications.length}
        />
        <ProgressTracker
          completedEssays={progressData.completedEssaysCount}
          totalEssays={progressData.totalEssays}
          submittedApplications={progressData.submittedApplicationsCount}
          totalApplications={progressData.totalApplications}
        />
        <ApplicationList
          sortAndFilterKey={sortAndFilterKey}
          applications={displayedApplications}
          essaysByApplicationId={essaysByApplicationId}
          tagsById={tagsById}
          schoolTags={schoolTags}
          essayTags={essayTags}
          expandedAppIds={expandedAppIds}
          filterTagId={filterTagId}
          onToggleExpand={handleToggleExpand}
          onUpdateApplication={handleUpdateApplication}
          onRequestDeleteApplication={requestDeleteApplication}
          onAddEssay={(appId) => setAddEssayModalOpen(appId)}
          onUpdateEssay={handleUpdateEssay}
          onToggleEssayComplete={handleToggleEssayComplete}
          onCommitEssayHistory={handleCommitEssayHistory}
          onRequestDeleteEssay={requestDeleteEssay}
          onReorderEssays={handleReorderEssays}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onRequestDeleteTask={requestDeleteTask}
          onAddTag={handleAddTag}
          expandedEssayIds={expandedEssayIds}
          onToggleEssayExpand={handleToggleEssayExpand}
          expandedSectionKeys={expandedSectionKeys}
          onToggleSectionExpand={handleToggleSectionExpand}
          onExpandAppContent={handleExpandAppContent}
          onCollapseAppContent={handleCollapseAppContent}
          onOpenHistoryViewer={(version) => setEssayHistoryViewer({ isOpen: true, version })}
        />
      </main>

      {isAddSchoolModalOpen && (
        <AddSchoolModal
          onClose={() => setAddSchoolModalOpen(false)}
          onAddSchool={handleAddSchool}
          schoolTags={schoolTags}
          onAddTag={handleAddTag}
        />
      )}
      {isAddEssayModalOpen && (
        <AddEssayModal
          applicationId={isAddEssayModalOpen}
          essayTags={essayTags}
          onClose={() => setAddEssayModalOpen(null)}
          onAddEssay={handleAddEssay}
          onAddTag={handleAddTag}
        />
      )}
      {isManageTagsModalOpen && (
        <ManageTagsModal
          tags={tags}
          onClose={() => setManageTagsModalOpen(false)}
          onAddTag={handleAddTag}
          // Fix: Pass the correct 'handleUpdateTag' function to the onUpdateTag prop.
          onUpdateTag={handleUpdateTag}
          onRequestDeleteTag={requestDeleteTag}
        />
      )}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      <EssayHistoryViewerModal
        isOpen={essayHistoryViewer.isOpen}
        version={essayHistoryViewer.version}
        onClose={() => setEssayHistoryViewer({ isOpen: false, version: null })}
      />
       <input
        type="file"
        ref={importFileRef}
        className="hidden"
        accept=".json"
        onChange={handleFileSelected}
      />
    </div>
  );
};

export default App;