import React from 'react';
import { EssayVersion } from '../../types';
import ModalWrapper from './ModalWrapper';

interface EssayHistoryViewerModalProps {
  isOpen: boolean;
  version: EssayVersion | null;
  onClose: () => void;
}

const EssayHistoryViewerModal: React.FC<EssayHistoryViewerModalProps> = ({ isOpen, version, onClose }) => {
  if (!isOpen || !version) return null;

  const formattedTimestamp = new Date(version.timestamp).toLocaleString();

  return (
    <ModalWrapper onClose={onClose} widthClass="max-w-2xl">
      <div className="h-[80vh] flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Essay Version</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Saved on {formattedTimestamp}</p>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
            {version.text || <em>(This version is empty)</em>}
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-700/50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EssayHistoryViewerModal;