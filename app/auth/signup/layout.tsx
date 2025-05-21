import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新規登録',
  description: '新しいアカウントを作成します',
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
