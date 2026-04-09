"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import NoticeForm, { type NoticeFormData } from '@/components/NoticeForm';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { createNotice } from '@/services/noticeService';
import type { NoticeCategory } from '@/types/content';

export default function CreateNoticePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const isAllowed =
    profile?.role === 'contributor' ||
    profile?.role === 'moderator' ||
    profile?.role === 'admin';

  const handleSubmit = async (data: NoticeFormData) => {
    if (!user) {
      throw new Error('You need to be signed in to post.');
    }

    const token = await user.getIdToken();

    if (!token) {
      throw new Error('Authentication error — please sign in again.');
    }

    await createNotice(
      {
        title: data.title,
        body: data.body,
        category: data.category as NoticeCategory,
        expiresAt: data.expiresAt,
        linkUrl: data.linkUrl.trim() || null,
        authorId: user.uid,
      },
      data.images,
      user.uid,
      token,
    );

    setSuccess(true);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          {!isAllowed ? (
            <StateMessage
              type="error"
              title="Access restricted"
              message="Only contributors and admins can create community notices."
              action={
                <button
                  onClick={() => router.push('/create')}
                  className="text-sm font-medium text-red-700 underline"
                >
                  Back to Create
                </button>
              }
            />
          ) : success ? (
            <StateMessage
              type="success"
              title="Notice posted!"
              message="Your notice is pending review and will be visible once approved."
              action={
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    Post another
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    Go home
                  </button>
                </div>
              }
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Notice</h1>
              <p className="text-sm text-slate-600 mb-6">Share announcements, alerts, or opportunities with the community.</p>
              <NoticeForm onSubmit={handleSubmit} />
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
