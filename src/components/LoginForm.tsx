"use client"; // Required for useState, useEffect, and event handlers

import { useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming firebase is initialized and auth is exported
import { GithubAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // On successful login, the onAuthStateChanged listener in withAdminAuth
      // will handle the UI update. No explicit redirect needed here.
    } catch (err) {
      console.error("GitHub Login Error:", err);
      const authError = err as AuthError; // Type assertion
      if (authError.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled. Please try again.");
      } else if (authError.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to login with GitHub. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-xl rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Admin Login</h2>
        {error && (
          <p className="text-red-600 mb-4 text-sm text-center bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
        <Button 
          onClick={handleLogin} 
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login with GitHub'}
          {/* TODO: Consider adding a GitHub icon here */}
        </Button>
        <p className="text-xs text-gray-500 mt-4 text-center">
          You will be redirected to GitHub to authorize this application.
        </p>
      </div>
    </div>
  );
}
