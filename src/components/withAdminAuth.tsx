"use client";

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import LoginForm from './LoginForm';
import { usePathname } from 'next/navigation';

// Basic Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

export default function withAdminAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAdminAuthComponent = (props: P) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            const tokenResult = await currentUser.getIdTokenResult(true);
            setIsAdmin(!!tokenResult.claims.admin);
          } catch {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, []);

    if (loading) {
      return <LoadingSpinner />;
    }

    // 未ログイン
    if (!user && pathname && pathname.startsWith('/admin')) {
      return <LoginForm />;
    }

    // ログイン済みだがadmin権限なし
    if (user && !isAdmin && pathname && pathname.startsWith('/admin')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-xl font-bold text-red-600 mb-4">管理者権限がありません</div>
          <div className="text-foreground">このページにアクセスするには管理者権限が必要です。</div>
        </div>
      );
    }

    // 管理者のみ許可
    if (user && isAdmin) {
      return <WrappedComponent {...props} />;
    }

    // 万一のフォールバック
    return <LoadingSpinner />;
  };

  WithAdminAuthComponent.displayName = `WithAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAdminAuthComponent;
}
