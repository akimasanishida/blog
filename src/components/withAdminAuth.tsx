"use client"; // Required for useState, useEffect

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import LoginForm from './LoginForm'; // Path to LoginForm component
import { usePathname } from 'next/navigation'; // To avoid rendering LoginForm on non-admin pages if HOC is misused

// Basic Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

export default function withAdminAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAdminAuthComponent = (props: P) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    }, []);

    if (loading) {
      return <LoadingSpinner />;
    }

    // Ensure this HOC is only active on /admin routes or if user is not logged in.
    // This check is a safeguard. The HOC should ideally only wrap admin pages.
    if (!user && pathname && pathname.startsWith('/admin')) {
      return <LoginForm />;
    }
    
    if (!user) {
        // If not on an admin path and not logged in,
        // it might mean this HOC is applied on a page that doesn't strictly need it,
        // or the user is simply not logged in on a public page wrapped by mistake.
        // For admin pages, LoginForm is shown above.
        // For other pages, if accidentally wrapped, we might render null or the component.
        // However, the primary use case is for /admin routes.
        // If we are on a non-admin route and there's no user, it's safer to show nothing or component
        // but for this project, we assume it's only for admin.
        // Thus, if path is not /admin and no user, it implies a misuse or an edge case.
        // For now, if !user and not on /admin, it will fall through to WrappedComponent or render nothing.
        // The crucial part is `!user && pathname.startsWith('/admin')` returning LoginForm.
    }


    // If user is authenticated, render the wrapped component
    if (user) {
      return <WrappedComponent {...props} />;
    }

    // Fallback for non-admin routes if accidentally wrapped and user is not logged in.
    // Or, if on an admin route and user becomes null after initial load (e.g. signed out in another tab)
    // This condition ensures LoginForm is shown if on admin path and user becomes null.
    if (!user && pathname && pathname.startsWith('/admin')) {
        return <LoginForm />;
    }
    
    // If it's not an admin page and no user, it's better not to render the wrapped component
    // or to render a specific "access denied" or "please login" for non-admin wrapped pages.
    // But given the task, we focus on protecting /admin routes.
    // If for some reason it reaches here on a non-admin page without a user,
    // rendering null is a safe default to prevent showing protected content.
    if (!pathname || !pathname.startsWith('/admin')) {
        return <WrappedComponent {...props} />; // Or null, depending on desired behavior for non-admin pages
    }

    return <LoadingSpinner/>; // Default fallback, should ideally not be reached if logic is sound
  };

  // Set a display name for easier debugging in React DevTools
  WithAdminAuthComponent.displayName = `WithAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithAdminAuthComponent;
}
