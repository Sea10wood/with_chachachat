'use client';
import type { Session } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ModalCore from './modalCore';
import { ModalType } from './modal/modalType';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const Navigation = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  if (session === null && pathname?.includes('/profile')) {
    router.push('/');
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました');
    }
  };

  return (
    <header>
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
        <nav className="hidden md:flex space-x-4">
          <div>
            <Link className="text-gray-600 hover:text-blue-600" href="/">
              Home
            </Link>
          </div>
          {session ? (
            <div>
              <Link
                className="text-gray-600 hover:text-blue-600"
                href="/profile"
              >
                Profile
              </Link>
            </div>
          ) : (
            <>
              <div>
                <ModalCore modalType={ModalType.SignIn}></ModalCore>
              </div>
              <div>
                <ModalCore modalType={ModalType.SignUp}></ModalCore>
              </div>
            </>
          )}
        </nav>
        {session && (
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-blue-600"
          >
            ログアウト
          </button>
        )}
      </div>
    </header>
  )
}

export default Navigation
