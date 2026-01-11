import { LogIn, LogOut, User } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';

export function UserMenu() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? 'User'}
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {user.displayName ?? 'User'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        void signIn();
      }}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <LogIn className="h-4 w-4" />
      <span>Sign in with Google</span>
    </button>
  );
}

// Compact version for collapsed sidebar
export function UserMenuCompact() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700" />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="group relative">
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          title={`Signed in as ${user.displayName ?? 'User'}`}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? 'User'}
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <User className="h-4 w-4" />
            </div>
          )}
        </button>
        {/* Tooltip */}
        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-slate-700">
            Sign out
            <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => {
          void signIn();
        }}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        title="Sign in with Google"
      >
        <LogIn className="h-5 w-5" />
      </button>
      {/* Tooltip */}
      <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-slate-700">
          Sign in
          <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
        </div>
      </div>
    </div>
  );
}
