import type React from 'react';
import Button from '../atoms/Button/Button';
import Popup from '../atoms/Popup';

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
}

const MessagePopup: React.FC<MessagePopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
}) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} type={type}>
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm">{message}</p>
        <Button
          variant="primary"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
          className="mt-4 px-4 py-2 bg-send-button text-gray-700 rounded-lg hover:bg-send-button/80 transition-colors"
        >
          閉じる
        </Button>
      </div>
    </Popup>
  );
};

export default MessagePopup;
