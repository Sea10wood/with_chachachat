import Link from 'next/link';

interface Props {
  modalType: 'signin' | 'signup';
}

const ModalCore = ({ modalType }: Props) => {
  const title = modalType === 'signin' ? 'ログイン' : '新規登録';
  const href = modalType === 'signin' ? '/auth/login' : '/auth/signup';

  return (
    <Link
      href={href}
      className="text-black hover:text-send-button transition-colors duration-200"
    >
      {title}
    </Link>
  );
};

export default ModalCore;
