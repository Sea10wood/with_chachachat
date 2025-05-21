import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'パスワードリセット',
  description: 'パスワードをリセットします',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
