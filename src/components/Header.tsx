'use client';

import Link from 'next/link';
import { ModeToggle } from './ModeToggle';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ListIcon, XIcon } from '@phosphor-icons/react';
import { auth } from '@/lib/firebase'; // Firebase Auth インスタンスのパスは適宜修正
import { useState } from 'react';
import { useAppConfig } from '@/context/AppConfigContext';

import { useEffect } from 'react';

const Header = () => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAdmin = async () => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          if (isMounted) setIsAdmin(!!tokenResult.claims.admin);
        } catch {
          if (isMounted) setIsAdmin(false);
        }
      } else {
        if (isMounted) setIsAdmin(false);
      }
    };
    checkAdmin();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin');
    setMenuOpen(false);
  };
  const config = useAppConfig();

  const menu = (
    <ul className="list-none flex flex-col md:flex-row m-0 p-0 items-center gap-4 md:gap-0">
      <li className="md:mr-4">
        <ModeToggle />
      </li>
      <li className="md:mr-4">
        <Link href="/" className="!text-foreground link-no-underline" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
      </li>
      <li className="md:mr-4">
        <Link href="/about" className="!text-foreground link-no-underline" onClick={() => setMenuOpen(false)}>
          About
        </Link>
      </li>
      <li className="md:mr-4">
        <a
          href={config.site.hp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="!text-foreground link-no-underline"
          onClick={() => setMenuOpen(false)}
        >
          HP
        </a>
      </li>
      {isAdmin && (
        <li className="md:mr-4">
          <Link href="/admin" className="!text-foreground link-no-underline" onClick={() => setMenuOpen(false)}>
            Admin
          </Link>
        </li>
      )}
      <li>
        {loading ? null : user ? (
          <button
            onClick={handleLogout}
            className="!text-foreground link-no-underline bg-transparent border-none cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <Link href="/login" className="!text-foreground link-no-underline" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}
      </li>
    </ul>
  );

  return (
    <header className="fixed top-0 left-0 w-full bg-[var(--background)]/50 backdrop-blur-sm z-50 py-4 px-6 flex justify-between items-center text-sm shadow-sm">
      <div>
        <Link href="/" className="text-xl !text-foreground link-no-underline font-bold">
          {config.site.title}
        </Link>
      </div>
      {/* PC: メニュー表示, モバイル: 非表示 */}
      <nav className="hidden md:block">
        {menu}
      </nav>
      {/* モバイル: ハンバーガーアイコン */}
      <button
        className="md:hidden p-2"
        aria-label="メニューを開く"
        onClick={() => setMenuOpen(true)}
      >
        <ListIcon size={28} />
      </button>
      {/* モバイル: メニュー本体（オーバーレイ） */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div className="bg-background w-48 h-80 shadow-lg p-6 flex flex-col">
            <button
              className="self-end mb-6"
              aria-label="メニューを閉じる"
              onClick={() => setMenuOpen(false)}
            >
              <XIcon size={28} />
            </button>
            {menu}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
