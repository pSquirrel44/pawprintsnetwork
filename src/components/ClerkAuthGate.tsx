import React from 'react';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';

interface ClerkAuthGateProps {
  isDog?: boolean;
  children: React.ReactNode;
}

export const ClerkAuthGate: React.FC<ClerkAuthGateProps> = ({ isDog = false, children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const [showSignUp, setShowSignUp] = React.useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <img
          src={isDog ? '/icons/instawoof-icon.png' : '/icons/instameow-icon.png'}
          alt="loading"
          className="w-20 h-20 rounded-[22%] shadow-2xl animate-pulse"
        />
        <p className="text-zinc-400 text-sm font-medium">Loading Pawprint Network…</p>
      </div>
    );
  }

  if (isSignedIn) return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 gap-6">
      {/* Brand header */}
      <div className="text-center space-y-3 mb-2">
        {/* App icon — references the uploaded logo as a CSS-styled placeholder
            Replace the emoji below with an <img> tag pointing to your logo asset
            once you add the PNG files to /public/icons/ in the repo */}
        <img
          src={isDog ? '/icons/instawoof-icon.png' : '/icons/instameow-icon.png'}
          alt={isDog ? 'instawoof' : 'instameow'}
          className="mx-auto w-24 h-24 rounded-[22%] shadow-2xl"
        />
        <div>
          <h1 className="text-2xl font-bold brand-text tracking-tight">
            {isDog ? 'instawoof' : 'instameow'}
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            by <span className="brand-color font-semibold">Pawprint Network</span>
          </p>
        </div>
        <p className="text-zinc-500 text-xs max-w-[260px] leading-relaxed">
          {isDog
            ? 'The social platform built for every good boy and good girl 🦴'
            : 'The social platform where cats run everything 🐾'}
        </p>
      </div>

      {/* Clerk sign-in / sign-up */}
      {showSignUp ? (
        <SignUp
          appearance={{
            variables: {
              colorPrimary: isDog ? '#06b6d4' : '#ec4899',
              colorBackground: '#18181b',
              colorText: '#f4f4f5',
              colorInputBackground: '#27272a',
              colorInputText: '#f4f4f5',
              borderRadius: '1rem',
            },
          }}
          routing="hash"
          signInUrl="#sign-in"
        />
      ) : (
        <SignIn
          appearance={{
            variables: {
              colorPrimary: isDog ? '#06b6d4' : '#ec4899',
              colorBackground: '#18181b',
              colorText: '#f4f4f5',
              colorInputBackground: '#27272a',
              colorInputText: '#f4f4f5',
              borderRadius: '1rem',
            },
          }}
          routing="hash"
          signUpUrl="#sign-up"
        />
      )}

      <p className="text-zinc-600 text-xs text-center">
        {showSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button
          onClick={() => setShowSignUp(!showSignUp)}
          className="brand-color hover:opacity-80 font-semibold transition-opacity"
        >
          {showSignUp ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </div>
  );
};
