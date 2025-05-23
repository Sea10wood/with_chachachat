import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'サインイン',
  description: 'アカウントにサインインします',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
