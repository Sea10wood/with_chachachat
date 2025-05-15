import { useState } from 'react';
import { ModalType } from './modal/modalType';
import SignUpForm from './modal/signupForm';
import SignInForm from './modal/signinForm';

interface Props {
  modalType: ModalType;
}

const ModalCore = ({ modalType }: Props) => {
  const [showModal, setShowModal] = useState(false);
  let title = "";
  let headerButton = "";
  let formElement = <p>フォームを読み込めませんでした。</p>;
  switch (modalType) {
    case ModalType.SignIn:
      title = "ログインフォーム";
      headerButton = "Login";
      formElement = <SignInForm showModal={setShowModal}></SignInForm>;
      break;

    case ModalType.SignUp:
      title = "ユーザ登録フォーム";
      headerButton = "Sign Up";
      formElement = <SignUpForm showModal={setShowModal}></SignUpForm>;
      break;
  }
  return (
    <>
      <button
        className="text-black hover:text-send-button transition-colors duration-200"
        type="button"
        onClick={() => setShowModal(true)}
      >
        {headerButton}
      </button>
      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full md:inset-0 max-h-full bg-black/30">
            <div className="m-auto relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-chat-bg rounded-lg shadow">
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-send-button rounded-t">
                  <h3 className="text-xl font-semibold text-black">
                    {title}
                  </h3>
                  <button
                    type="button"
                    className="end-2.5 text-black bg-transparent hover:bg-send-button/20 hover:text-loading-color rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-colors duration-200"
                    data-modal-hide="authentication-modal"
                    onClick={() => setShowModal(false)}
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
                <div className="p-4 md:p-5">{formElement}</div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ModalCore;
