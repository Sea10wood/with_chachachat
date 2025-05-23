import type { Dispatch, SetStateAction } from 'react';
import Button from '../atoms/Button/Button';

interface ErrorModalProps {
  message: string;
  showModal: Dispatch<SetStateAction<boolean>>;
  isError?: boolean;
}

export default function ErrorModal({
  message,
  showModal,
  isError = true,
}: ErrorModalProps) {
  const handleClose = () => {
    showModal(false);
  };

  return (
    <Button
      type="button"
      className="fixed inset-0 z-50 flex items-center justify-center w-full md:inset-0 max-h-full bg-black/30"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClose();
        }
      }}
      aria-label="モーダルを閉じる"
    >
      <Button
        type="button"
        className="relative p-4 w-full max-w-md max-h-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
          }
        }}
        aria-label="モーダルコンテンツ"
      >
        <div className="relative bg-chat-bg dark:bg-black/20 rounded-lg shadow">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-send-button rounded-t">
            <h3
              className={`text-xl font-semibold ${isError ? 'text-loading-color' : 'text-black dark:text-global-bg'}`}
            >
              {isError ? 'エラー' : '完了'}
            </h3>
            <Button
              variant="secondary"
              onClick={handleClose}
              className="end-2.5 text-black dark:text-global-bg bg-transparent hover:bg-send-button/20 hover:text-loading-color rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-colors duration-200"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">モーダルを閉じる</span>
            </Button>
          </div>
          <div className="p-4 md:p-5">
            <p className="text-black dark:text-global-bg">{message}</p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="primary"
                onClick={handleClose}
                className="text-black dark:text-global-bg bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      </Button>
    </Button>
  );
}
