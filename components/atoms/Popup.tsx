import type React from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error';
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children, type = 'info' }) => {
  if (!isOpen) return null;

  const bgColor = {
    info: 'bg-chat-bg',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
  }[type];

  const textColor = {
    info: 'text-gray-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative p-6 rounded-lg shadow-lg ${bgColor} ${textColor} max-w-sm w-full mx-4 transform transition-all duration-200 ease-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
