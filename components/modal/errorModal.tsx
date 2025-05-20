import { Dispatch, SetStateAction } from "react";

interface ErrorModalProps {
  message: string;
  showModal: Dispatch<SetStateAction<boolean>>;
  isError?: boolean;
}

export default function ErrorModal({ message, showModal, isError = true }: ErrorModalProps) {
  const handleClose = () => {
    showModal(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center w-full md:inset-0 max-h-full bg-black/30"
      onClick={handleClose}
    >
      <div 
        className="relative p-4 w-full max-w-md max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-chat-bg dark:bg-black/20 rounded-lg shadow">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-send-button rounded-t">
            <h3 className={`text-xl font-semibold ${isError ? "text-loading-color" : "text-black dark:text-global-bg"}`}>
              {isError ? "エラー" : "完了"}
            </h3>
            <button
              type="button"
              className="end-2.5 text-black dark:text-global-bg bg-transparent hover:bg-send-button/20 hover:text-loading-color rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-colors duration-200"
              onClick={handleClose}
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
            </button>
          </div>
          <div className="p-4 md:p-5">
            <p className="text-black dark:text-global-bg">{message}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="text-black dark:text-global-bg bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200"
                onClick={handleClose}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 