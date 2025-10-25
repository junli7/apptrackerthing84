import React from 'react';
import ExclamationTriangleIcon from '../icons/ExclamationTriangleIcon';
import ModalWrapper from './ModalWrapper';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-0 text-left flex-grow">
              <h3 className="text-lg leading-6 font-bold text-zinc-900 dark:text-white" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-700/50 px-6 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
    </ModalWrapper>
  );
};

export default ConfirmationModal;