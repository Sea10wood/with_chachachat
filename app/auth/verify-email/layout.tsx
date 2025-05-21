import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'メール確認',
  description: 'メールアドレスを確認します',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
