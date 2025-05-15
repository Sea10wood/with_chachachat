import { Dispatch, SetStateAction } from "react";
import Link from 'next/link';

export default function SignInForm(props: {
  showModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { showModal } = props;
  return (
    <form action="/auth/login" method="post" className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-black"
        >
          メールアドレス
        </label>
        <input
          type="email"
          name="email"
          id="email"
          className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button block w-full p-2.5"
          placeholder="name@company.com"
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-black"
        >
          パスワード
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="••••••••"
          className="bg-input-bg border border-send-button text-black text-sm rounded-lg focus:ring-send-button focus:border-send-button block w-full p-2.5"
          required
        />
      </div>
      <div className="text-right">
        <Link className="font-medium text-send-button hover:text-loading-color hover:underline" href={`${location.origin}/resetPassword`} onClick={() => showModal(false)}>パスワードを忘れた場合</Link>
      </div>
      <div>
        <button className="w-full text-black bg-send-button hover:bg-loading-color focus:ring-4 focus:outline-none focus:ring-send-button/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors duration-200">
          サインイン
        </button>
      </div>
    </form>
  );
}
