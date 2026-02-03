import React, { useMemo, useState } from 'react';
import { Application, Tag, Outcome } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon';
import ClockIcon from './icons/ClockIcon';
import XMarkIcon from './icons/XMarkIcon';
import PlusIcon from './icons/PlusIcon';
import { COMMON_LOCATIONS } from './modals/AddSchoolModal';

interface MapViewProps {
  applications: Application[];
  tagsById: Record<string, Tag>;
  onSelectApplication: (appId: string) => void;
  onUpdateApplication?: (app: Application) => void;
}

// US Continental bounds for Albers projection simulation
const US_BOUNDS = {
  minLat: 24.396308,
  maxLat: 49.384358,
  minLng: -124.848974,
  maxLng: -66.885444,
};

// Improved lat/lng to SVG position conversion with aspect ratio correction
const latLngToSvgPosition = (lat: number, lng: number, svgWidth: number, svgHeight: number) => {
  // Normalize to 0-1 range
  const xNorm = (lng - US_BOUNDS.minLng) / (US_BOUNDS.maxLng - US_BOUNDS.minLng);
  const yNorm = (US_BOUNDS.maxLat - lat) / (US_BOUNDS.maxLat - US_BOUNDS.minLat);

  // Map padding (matching the viewBox padding)
  const padding = 20;
  const mapWidth = svgWidth - (2 * padding);
  const mapHeight = svgHeight - (2 * padding);

  return {
    x: padding + (xNorm * mapWidth),
    y: padding + (yNorm * mapHeight),
  };
};

const getOutcomeConfig = (outcome: Outcome) => {
  switch (outcome) {
    case Outcome.ACCEPTED:
      return {
        color: 'bg-green-500',
        ring: 'ring-green-300 dark:ring-green-700',
        icon: CheckBadgeIcon,
        gradient: 'from-green-400 to-emerald-500',
      };
    case Outcome.REJECTED:
      return {
        color: 'bg-red-500',
        ring: 'ring-red-300 dark:ring-red-700',
        icon: XMarkIcon,
        gradient: 'from-red-400 to-rose-500',
      };
    case Outcome.WAITLISTED:
    case Outcome.DEFERRED:
      return {
        color: 'bg-amber-500',
        ring: 'ring-amber-300 dark:ring-amber-700',
        icon: ClockIcon,
        gradient: 'from-amber-400 to-yellow-500',
      };
    case Outcome.SUBMITTED:
      return {
        color: 'bg-blue-500',
        ring: 'ring-blue-300 dark:ring-blue-700',
        icon: ClockIcon,
        gradient: 'from-blue-400 to-indigo-500',
      };
    default:
      return {
        color: 'bg-zinc-500',
        ring: 'ring-zinc-300 dark:ring-zinc-600',
        icon: ClockIcon,
        gradient: 'from-zinc-400 to-zinc-500',
      };
  }
};

// Accurate US state paths - simplified but geographically correct
// ViewBox is 960 x 600 to match standard US map proportions
const US_STATE_PATHS: Record<string, { path: string; abbr: string; labelX: number; labelY: number }> = {
  WA: { path: "M108,32 L118,30 L140,28 L165,30 L178,38 L180,55 L175,70 L155,75 L130,72 L110,60 L105,45 Z", abbr: "WA", labelX: 142, labelY: 52 },
  OR: { path: "M108,70 L155,75 L175,70 L182,88 L178,115 L160,130 L130,135 L100,130 L95,110 L98,85 Z", abbr: "OR", labelX: 138, labelY: 105 },
  CA: { path: "M95,130 L130,135 L160,130 L175,160 L185,200 L175,250 L165,290 L150,310 L120,305 L100,280 L95,240 L100,200 L90,160 Z", abbr: "CA", labelX: 135, labelY: 220 },
  NV: { path: "M160,130 L182,115 L200,120 L220,135 L225,180 L215,225 L185,250 L165,240 L175,200 L175,160 Z", abbr: "NV", labelX: 195, labelY: 180 },
  ID: { path: "M178,38 L210,35 L235,45 L240,70 L235,100 L200,120 L182,115 L178,88 L175,70 L180,55 Z", abbr: "ID", labelX: 210, labelY: 80 },
  UT: { path: "M200,120 L235,100 L260,105 L280,120 L280,180 L265,210 L225,220 L215,225 L225,180 L220,135 Z", abbr: "UT", labelX: 250, labelY: 165 },
  AZ: { path: "M165,240 L185,250 L215,225 L225,220 L240,265 L235,310 L215,335 L175,330 L165,300 L165,290 Z", abbr: "AZ", labelX: 200, labelY: 290 },
  MT: { path: "M210,35 L280,30 L340,28 L365,35 L370,70 L355,95 L310,100 L265,95 L235,100 L240,70 L235,45 Z", abbr: "MT", labelX: 295, labelY: 62 },
  WY: { path: "M265,95 L310,100 L355,95 L360,130 L355,165 L310,170 L265,165 L260,130 L260,105 Z", abbr: "WY", labelX: 310, labelY: 135 },
  CO: { path: "M265,165 L310,170 L355,165 L360,210 L355,250 L310,255 L265,250 L260,210 L265,180 Z", abbr: "CO", labelX: 310, labelY: 215 },
  NM: { path: "M265,250 L310,255 L355,250 L360,300 L355,345 L310,350 L265,345 L260,300 Z", abbr: "NM", labelX: 310, labelY: 300 },
  ND: { path: "M365,35 L420,32 L470,35 L475,68 L470,98 L420,95 L370,95 L370,70 Z", abbr: "ND", labelX: 420, labelY: 65 },
  SD: { path: "M370,95 L420,95 L470,98 L475,135 L470,170 L420,168 L370,165 L370,130 Z", abbr: "SD", labelX: 420, labelY: 132 },
  NE: { path: "M355,165 L370,165 L420,168 L470,170 L485,195 L480,230 L430,228 L380,225 L360,210 Z", abbr: "NE", labelX: 420, labelY: 198 },
  KS: { path: "M360,230 L380,225 L430,228 L480,230 L485,275 L480,315 L430,312 L380,310 L375,275 Z", abbr: "KS", labelX: 428, labelY: 272 },
  OK: { path: "M355,310 L380,310 L430,312 L480,315 L495,345 L490,375 L440,372 L385,375 L355,365 L340,345 L355,320 Z", abbr: "OK", labelX: 425, labelY: 350 },
  TX: { path: "M355,345 L355,365 L385,375 L440,372 L490,375 L510,405 L495,450 L460,490 L420,510 L370,500 L330,480 L300,440 L290,400 L300,365 L320,345 L340,345 Z", abbr: "TX", labelX: 390, labelY: 430 },
  MN: { path: "M470,35 L510,32 L550,38 L555,85 L545,130 L500,135 L475,130 L475,98 L470,68 Z", abbr: "MN", labelX: 515, labelY: 85 },
  IA: { path: "M475,130 L500,135 L545,130 L560,165 L555,200 L510,205 L485,195 L470,170 L475,135 Z", abbr: "IA", labelX: 520, labelY: 168 },
  MO: { path: "M485,230 L510,205 L555,200 L575,225 L590,265 L585,310 L540,315 L495,310 L480,275 L480,230 Z", abbr: "MO", labelX: 540, labelY: 265 },
  AR: { path: "M495,310 L540,315 L585,310 L595,350 L590,385 L545,390 L510,385 L495,350 Z", abbr: "AR", labelX: 545, labelY: 350 },
  LA: { path: "M510,385 L545,390 L590,385 L605,420 L600,455 L565,470 L520,460 L505,430 Z", abbr: "LA", labelX: 555, labelY: 430 },
  WI: { path: "M550,38 L590,42 L620,55 L635,95 L630,135 L590,145 L555,140 L545,130 L555,85 Z", abbr: "WI", labelX: 590, labelY: 95 },
  IL: { path: "M555,140 L590,145 L620,155 L625,200 L610,250 L580,270 L555,265 L555,200 L560,165 Z", abbr: "IL", labelX: 590, labelY: 205 },
  MI: { path: "M620,55 L645,48 L680,55 L700,85 L695,130 L660,145 L635,140 L630,135 L635,95 Z", abbr: "MI", labelX: 665, labelY: 100 },
  IN: { path: "M620,155 L640,150 L660,155 L665,200 L660,245 L625,250 L610,250 L625,200 Z", abbr: "IN", labelX: 640, labelY: 200 },
  OH: { path: "M660,145 L695,130 L720,140 L730,175 L725,215 L695,225 L665,220 L660,200 L660,155 Z", abbr: "OH", labelX: 695, labelY: 180 },
  KY: { path: "M585,270 L610,250 L660,245 L695,250 L720,265 L710,300 L660,310 L610,305 L590,285 Z", abbr: "KY", labelX: 655, labelY: 280 },
  TN: { path: "M595,305 L660,310 L710,300 L740,310 L735,340 L690,350 L630,355 L585,350 L585,320 Z", abbr: "TN", labelX: 665, labelY: 330 },
  MS: { path: "M585,350 L630,355 L640,395 L635,440 L590,445 L565,440 L565,400 L580,375 Z", abbr: "MS", labelX: 605, labelY: 400 },
  AL: { path: "M630,355 L680,360 L690,400 L685,450 L650,460 L635,455 L635,440 L640,395 Z", abbr: "AL", labelX: 665, labelY: 405 },
  WV: { path: "M720,210 L740,195 L755,210 L760,240 L750,260 L725,270 L710,260 L710,235 Z", abbr: "WV", labelX: 735, labelY: 235 },
  VA: { path: "M710,260 L750,260 L790,250 L830,235 L840,260 L810,285 L760,295 L720,290 L710,280 Z", abbr: "VA", labelX: 770, labelY: 270 },
  NC: { path: "M720,295 L760,295 L810,285 L850,280 L870,300 L850,325 L790,335 L730,340 L700,330 Z", abbr: "NC", labelX: 790, labelY: 310 },
  SC: { path: "M730,340 L790,335 L820,345 L810,380 L770,395 L735,385 L720,360 Z", abbr: "SC", labelX: 770, labelY: 365 },
  GA: { path: "M690,360 L735,360 L770,395 L775,440 L760,475 L720,480 L690,460 L685,420 L690,400 Z", abbr: "GA", labelX: 730, labelY: 420 },
  FL: { path: "M720,455 L760,475 L785,490 L820,530 L825,570 L790,580 L755,560 L730,520 L720,480 Z", abbr: "FL", labelX: 770, labelY: 530 },
  PA: { path: "M730,175 L770,165 L825,160 L840,180 L835,210 L795,220 L755,215 L735,210 Z", abbr: "PA", labelX: 785, labelY: 190 },
  NY: { path: "M770,115 L810,105 L855,100 L880,120 L870,155 L840,170 L795,175 L770,165 L765,140 Z", abbr: "NY", labelX: 820, labelY: 140 },
  NJ: { path: "M835,195 L850,180 L862,195 L858,225 L845,240 L830,230 Z", abbr: "NJ", labelX: 848, labelY: 210 },
  MD: { path: "M795,230 L835,220 L850,235 L840,255 L810,260 L785,250 Z", abbr: "MD", labelX: 825, labelY: 243 },
  DE: { path: "M850,220 L862,218 L865,240 L855,248 L848,235 Z", abbr: "DE", labelX: 858, labelY: 232 },
  CT: { path: "M860,155 L880,150 L885,168 L870,175 L858,170 Z", abbr: "CT", labelX: 872, labelY: 163 },
  RI: { path: "M885,148 L895,145 L898,160 L890,165 L883,158 Z", abbr: "RI", labelX: 892, labelY: 155 },
  MA: { path: "M860,130 L890,122 L910,128 L905,145 L880,150 L862,145 Z", abbr: "MA", labelX: 885, labelY: 138 },
  VT: { path: "M855,95 L870,90 L878,110 L872,130 L858,125 L852,105 Z", abbr: "VT", labelX: 865, labelY: 112 },
  NH: { path: "M870,80 L885,75 L892,100 L885,122 L872,118 L870,95 Z", abbr: "NH", labelX: 882, labelY: 100 },
  ME: { path: "M885,45 L920,35 L935,65 L920,100 L895,105 L885,85 L890,60 Z", abbr: "ME", labelX: 910, labelY: 70 },
};

const MapMarker: React.FC<{
  application: Application;
  position: { x: number; y: number };
  onSelect: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ application, position, onSelect, isHovered, onHover, size = 'md' }) => {
  const config = getOutcomeConfig(application.outcome);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <button
        onClick={onSelect}
        className="relative group"
      >
        {/* Pulse animation for accepted */}
        {application.outcome === Outcome.ACCEPTED && (
          <span
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} animate-ping opacity-40`}
            style={{ animationDuration: '2s' }}
          />
        )}

        {/* Marker dot */}
        <div className={`
          relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${config.gradient}
          ring-4 ${config.ring} ring-opacity-60
          flex items-center justify-center
          shadow-lg shadow-black/20 cursor-pointer
          transition-all duration-300 ease-out
          hover:scale-150 hover:z-30 hover:shadow-xl
          ${isHovered ? 'scale-150 z-30 shadow-xl' : ''}
        `}>
          <Icon className={`${iconSizes[size]} text-white drop-shadow-sm`} />
        </div>

        {/* Tooltip */}
        <div className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-3
          bg-zinc-900/95 dark:bg-white/95 backdrop-blur-sm
          text-white dark:text-zinc-900
          px-4 py-2.5 rounded-xl shadow-2xl
          text-sm font-medium whitespace-nowrap
          transition-all duration-300 ease-out
          border border-white/10 dark:border-zinc-900/10
          ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
        `}>
          <div className="font-bold text-base">{application.schoolName}</div>
          {application.location && (
            <div className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5 flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" />
              {application.location.city}, {application.location.state}
            </div>
          )}
          <div className={`text-xs mt-1.5 px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${config.gradient} text-white`}>
            {application.outcome}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-zinc-900/95 dark:border-t-white/95" />
          </div>
        </div>
      </button>
    </div>
  );
};

// Location editor for schools without locations
const LocationEditor: React.FC<{
  application: Application;
  onSave: (app: Application) => void;
  onCancel: () => void;
}> = ({ application, onSave, onCancel }) => {
  const [selectedLocation, setSelectedLocation] = useState<typeof COMMON_LOCATIONS[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLocations = useMemo(() => {
    if (!searchTerm) return COMMON_LOCATIONS;
    const term = searchTerm.toLowerCase();
    return COMMON_LOCATIONS.filter(
      loc => loc.city.toLowerCase().includes(term) || loc.state.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleSave = () => {
    if (selectedLocation) {
      onSave({
        ...application,
        location: {
          city: selectedLocation.city,
          state: selectedLocation.state,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn border border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
              <MapPinIcon className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Add Location
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {application.schoolName}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-zinc-100 dark:bg-zinc-700 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Location grid */}
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
            {filteredLocations.map((loc) => (
              <button
                key={`${loc.city}-${loc.state}`}
                onClick={() => setSelectedLocation(loc)}
                className={`p-3 text-left rounded-xl transition-all duration-200 ${
                  selectedLocation?.city === loc.city && selectedLocation?.state === loc.state
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-[1.02]'
                    : 'bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 hover:scale-[1.02]'
                }`}
              >
                <div className="font-semibold text-sm">{loc.city}</div>
                <div className={`text-xs ${
                  selectedLocation?.city === loc.city && selectedLocation?.state === loc.state
                    ? 'text-green-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}>{loc.state}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 flex justify-end gap-3 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedLocation}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/25 disabled:shadow-none"
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
};

const MapView: React.FC<MapViewProps> = ({
  applications,
  tagsById,
  onSelectApplication,
  onUpdateApplication,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Outcome>('all');
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  // Filter applications with valid locations
  const mappableApps = useMemo(() => {
    let filtered = applications.filter(app =>
      app.location?.lat !== undefined &&
      app.location?.lng !== undefined
    );

    if (filter !== 'all') {
      filtered = filtered.filter(app => app.outcome === filter);
    }

    return filtered;
  }, [applications, filter]);

  // Apps without locations
  const appsWithoutLocation = useMemo(() => {
    return applications.filter(app => !app.location?.lat || !app.location?.lng);
  }, [applications]);

  const outcomeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(app => {
      if (app.location?.lat !== undefined) {
        counts[app.outcome] = (counts[app.outcome] || 0) + 1;
      }
    });
    return counts;
  }, [applications]);

  const handleSaveLocation = (app: Application) => {
    if (onUpdateApplication) {
      onUpdateApplication(app);
    }
    setEditingApp(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg shadow-rose-500/25">
              <MapPinIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">School Locations</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {mappableApps.length} of {applications.length} schools mapped
              </p>
            </div>
          </div>

          {/* Filter buttons */}
          {mappableApps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                All ({mappableApps.length})
              </button>
              {outcomeCounts[Outcome.ACCEPTED] > 0 && (
                <button
                  onClick={() => setFilter(Outcome.ACCEPTED)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === Outcome.ACCEPTED
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                  }`}
                >
                  Accepted ({outcomeCounts[Outcome.ACCEPTED]})
                </button>
              )}
              {outcomeCounts[Outcome.SUBMITTED] > 0 && (
                <button
                  onClick={() => setFilter(Outcome.SUBMITTED)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === Outcome.SUBMITTED
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                >
                  Submitted ({outcomeCounts[Outcome.SUBMITTED]})
                </button>
              )}
              {(outcomeCounts[Outcome.DEFERRED] || 0) + (outcomeCounts[Outcome.WAITLISTED] || 0) > 0 && (
                <button
                  onClick={() => setFilter(Outcome.DEFERRED)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === Outcome.DEFERRED
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/25'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                  }`}
                >
                  Deferred ({(outcomeCounts[Outcome.DEFERRED] || 0) + (outcomeCounts[Outcome.WAITLISTED] || 0)})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schools without locations */}
      {appsWithoutLocation.length > 0 && onUpdateApplication && (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
              <PlusIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100 text-lg">
                {appsWithoutLocation.length} school{appsWithoutLocation.length > 1 ? 's' : ''} need locations
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                Click a school to add its location and see it on the map
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {appsWithoutLocation.map(app => {
              const config = getOutcomeConfig(app.outcome);
              return (
                <button
                  key={app.id}
                  onClick={() => setEditingApp(app)}
                  className="flex items-center gap-3 p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-xl text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-amber-200/50 dark:border-amber-800/30 group"
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${config.gradient} ring-2 ring-white dark:ring-zinc-700`} />
                  <div className="min-w-0 flex-grow">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate text-sm">
                      {app.schoolName}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      Add location →
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Container */}
      {mappableApps.length > 0 ? (
        <>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '62.5%' }}>
              {/* SVG Map with accurate state shapes */}
              <svg
                viewBox="0 0 960 600"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="grad-accepted" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="grad-rejected" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                  <linearGradient id="grad-pending" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <linearGradient id="grad-submitted" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#71717a" />
                    <stop offset="100%" stopColor="#52525b" />
                  </linearGradient>
                  <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="[stop-color:#e0f2fe] dark:[stop-color:#1e293b]" />
                    <stop offset="100%" className="[stop-color:#bae6fd] dark:[stop-color:#0f172a]" />
                  </linearGradient>
                  <filter id="state-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.15" />
                  </filter>
                  <filter id="marker-glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Ocean background */}
                <rect width="960" height="600" fill="url(#ocean-gradient)" />

                {/* Grid pattern */}
                <g className="opacity-20 dark:opacity-10">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="#94a3b8" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 13 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 50} x2="960" y2={i * 50} stroke="#94a3b8" strokeWidth="0.5" />
                  ))}
                </g>

                {/* State shapes */}
                <g filter="url(#state-shadow)">
                  {Object.entries(US_STATE_PATHS).map(([stateCode, state]) => (
                    <path
                      key={stateCode}
                      d={state.path}
                      className="fill-sky-100 dark:fill-zinc-700 stroke-sky-300 dark:stroke-zinc-500 hover:fill-sky-200 dark:hover:fill-zinc-600 transition-colors duration-200"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  ))}
                </g>

                {/* State labels */}
                <g className="pointer-events-none">
                  {Object.entries(US_STATE_PATHS).map(([stateCode, state]) => (
                    <text
                      key={`label-${stateCode}`}
                      x={state.labelX}
                      y={state.labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-zinc-500 dark:fill-zinc-400 text-[11px] font-semibold"
                    >
                      {state.abbr}
                    </text>
                  ))}
                </g>

                {/* Great Lakes */}
                <g className="pointer-events-none">
                  <ellipse cx="650" cy="85" rx="25" ry="18" className="fill-sky-200 dark:fill-zinc-600" />
                  <ellipse cx="680" cy="60" rx="15" ry="12" className="fill-sky-200 dark:fill-zinc-600" />
                  <ellipse cx="615" cy="95" rx="12" ry="10" className="fill-sky-200 dark:fill-zinc-600" />
                </g>

                {/* School Markers */}
                {mappableApps.map(app => {
                  const pos = latLngToSvgPosition(app.location!.lat!, app.location!.lng!, 960, 600);
                  const config = getOutcomeConfig(app.outcome);
                  const isHovered = hoveredId === app.id;
                  const baseSize = isHovered ? 14 : 10;

                  const getGradientId = () => {
                    switch (app.outcome) {
                      case Outcome.ACCEPTED: return 'grad-accepted';
                      case Outcome.REJECTED: return 'grad-rejected';
                      case Outcome.WAITLISTED:
                      case Outcome.DEFERRED: return 'grad-pending';
                      case Outcome.SUBMITTED: return 'grad-submitted';
                      default: return 'grad-default';
                    }
                  };

                  return (
                    <g
                      key={app.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onMouseEnter={() => setHoveredId(app.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => onSelectApplication(app.id)}
                      style={{ cursor: 'pointer' }}
                      filter={isHovered ? 'url(#marker-glow)' : undefined}
                    >
                      {/* Pulse for accepted */}
                      {app.outcome === Outcome.ACCEPTED && (
                        <circle r={baseSize + 8} fill="none" stroke="url(#grad-accepted)" strokeWidth="2" opacity="0.4">
                          <animate attributeName="r" from={baseSize} to={baseSize + 25} dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Outer glow ring */}
                      <circle
                        r={baseSize + 4}
                        fill="white"
                        opacity={isHovered ? 0.95 : 0.8}
                        style={{ transition: 'all 0.2s ease' }}
                      />

                      {/* Main marker */}
                      <circle
                        r={baseSize}
                        fill={`url(#${getGradientId()})`}
                        stroke="white"
                        strokeWidth="2"
                        style={{ transition: 'all 0.2s ease' }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* HTML Tooltips layer */}
              {mappableApps.map(app => {
                if (hoveredId !== app.id) return null;
                const pos = latLngToSvgPosition(app.location!.lat!, app.location!.lng!, 960, 600);
                const config = getOutcomeConfig(app.outcome);
                // Convert SVG coordinates to percentages
                const xPercent = (pos.x / 960) * 100;
                const yPercent = (pos.y / 600) * 100;

                return (
                  <div
                    key={`tooltip-${app.id}`}
                    className="absolute z-50 pointer-events-none animate-fadeIn"
                    style={{
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      transform: 'translate(-50%, calc(-100% - 20px))',
                    }}
                  >
                    <div className="bg-zinc-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl border border-white/10 dark:border-zinc-900/10 whitespace-nowrap">
                      <div className="font-bold text-sm">{app.schoolName}</div>
                      <div className="text-xs text-zinc-300 dark:text-zinc-600 mt-1 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {app.location?.city}, {app.location?.state}
                      </div>
                      <div className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${config.gradient} text-white`}>
                        {app.outcome}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="border-8 border-transparent border-t-zinc-900/95 dark:border-t-white/95" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-800/50 dark:to-zinc-800">
              <div className="flex flex-wrap gap-5 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 ring-2 ring-green-300/50 shadow-sm" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-blue-300/50 shadow-sm" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 ring-2 ring-amber-300/50 shadow-sm" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Deferred/Waitlisted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-rose-500 ring-2 ring-red-300/50 shadow-sm" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 ring-2 ring-zinc-300/50 shadow-sm" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">In Progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* School List */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-lg">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4 text-lg">Schools on Map</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {mappableApps.map(app => {
                const config = getOutcomeConfig(app.outcome);
                return (
                  <button
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    onMouseEnter={() => setHoveredId(app.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${
                      hoveredId === app.id
                        ? 'bg-zinc-100 dark:bg-zinc-700 shadow-lg -translate-y-1'
                        : 'bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${config.gradient} ring-2 ring-white dark:ring-zinc-600 shadow-sm`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-white truncate">
                        {app.schoolName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {app.location?.city}, {app.location?.state}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-20 px-8 bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse scale-150"></div>
            <div className="relative bg-gradient-to-br from-sky-100 to-blue-100 dark:from-blue-900/50 dark:to-indigo-900/50 p-8 rounded-full shadow-lg">
              <MapPinIcon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-3">
            No Locations Yet
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto text-lg">
            Add locations to your schools above to see them on the interactive map.
          </p>
        </div>
      )}

      {/* Location Editor Modal */}
      {editingApp && (
        <LocationEditor
          application={editingApp}
          onSave={handleSaveLocation}
          onCancel={() => setEditingApp(null)}
        />
      )}
    </div>
  );
};

export default MapView;
