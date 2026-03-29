'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(promptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
    console.info('PWA install choice:', result.outcome);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-indigo-600 px-4 py-3 text-center text-sm text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="font-semibold">Install NIS Hub for faster access and offline mode.</p>
        <div className="flex items-center gap-2">
          <button
            onClick={install}
            className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-slate-100"
          >
            Install
          </button>
          <button
            onClick={() => setVisible(false)}
            className="rounded-lg border border-white px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500/90"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};
