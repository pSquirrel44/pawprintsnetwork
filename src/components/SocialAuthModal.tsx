import React from 'react';
import { X, ShieldCheck, LogOut, User } from 'lucide-react';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import { CatProfile } from '../types';

interface SocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: CatProfile;
  onUpdateSocialLinked: (platform: string) => void;
  isDog?: boolean;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  isDog = false,
}) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const isEmailVerified = user?.primaryEmailAddress?.verification.status === 'verified';

  if (!isOpen) return null;

  const platformName = isDog ? 'The Dog Park' : 'The Catwalk';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r brand-bg text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-base font-bold">Your Account</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <SignedIn>
            {/* Clerk user info */}
            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName ?? ''} className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--brand-accent)]" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="w-7 h-7 text-amber-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{user?.fullName ?? user?.username}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className={`w-3.5 h-3.5 ${isEmailVerified ? 'text-green-500' : 'text-amber-500'}`} />
                  <span className={`text-[11px] font-semibold ${isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isEmailVerified ? 'Email verified' : 'Signed in · email not verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active cat/dog profile */}
            <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl">
              <img src={activeProfile.avatar} alt={activeProfile.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{activeProfile.name}</p>
                <p className="text-[11px] text-zinc-500">@{activeProfile.handle} · {platformName}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => { openUserProfile(); onClose(); }}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-2.5 transition-colors"
              >
                <User className="w-4 h-4" />
                Manage Clerk Account & Security
              </button>

              <button
                onClick={() => signOut()}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              🔒 Secured by <span className="font-semibold">Clerk</span> · Pawprint Network
            </p>
          </SignedIn>

          <SignedOut>
            <p className="text-center text-sm text-zinc-500 py-4">
              You are not signed in. Please reload the app.
            </p>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};
