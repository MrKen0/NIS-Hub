"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import HelpRequestForm, { type HelpRequestFormData } from '@/components/HelpRequestForm';
import MatchResultCard from '@/components/MatchResultCard';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { createHelpRequest } from '@/services/helpRequestService';
import { findMatchesForRequest } from '@/services/matchingService';
import { REQUEST_MATCH_ROUTING } from '@/types/content';
import type { HelpRequest, StevenageArea, RequestCategory } from '@/types/content';
import type { MatchResult } from '@/types/matching';

// -------------------------------------------------------
// Page state machine
// -------------------------------------------------------
// form       → user fills in their request
// checking   → running pre-submit match query (skeleton shown)
// previewing → match results displayed; user decides what to do
// posting    → createHelpRequest in-flight (skeleton shown)
// done       → request created; success screen shown
// -------------------------------------------------------

type Stage = 'form' | 'checking' | 'previewing' | 'posting' | 'done';

export default function CreateRequestPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>('form');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<HelpRequestFormData | null>(null);
  const [previewMatches, setPreviewMatches] = useState<MatchResult[]>([]);
  const [postError, setPostError] = useState('');
  // Incrementing this key forces HelpRequestForm to re-mount and pick up new defaultValues
  const [formKey, setFormKey] = useState(0);

  // Default values for a fresh form (first load or "Post another")
  const initialDefaults = {
    whatsapp: profile?.phone ?? '',
    phone: profile?.phone ?? '',
    location: profile?.area ?? '',
  };

  // -------------------------------------------------------
  // Called by HelpRequestForm on submit
  // -------------------------------------------------------
  const handleSubmit = async (data: HelpRequestFormData) => {
    if (!user) return;

    // Decide whether a pre-submit preview is appropriate
    const routing = data.category
      ? REQUEST_MATCH_ROUTING[data.category as RequestCategory]
      : null;
    const routesToProducts = routing?.target === 'products';

    // Preview requires both category and location to be meaningful,
    // and must not be a product-routing category
    const canPreview = !!data.category && !!data.location && !routesToProducts;

    if (!canPreview) {
      // Direct path — errors bubble up to HelpRequestForm's own error handler
      const id = await createHelpRequest({
        text: data.text,
        category: (data.category as HelpRequest['category']) || null,
        location: data.location as StevenageArea,
        urgency: data.urgency,
        preferredContact: data.preferredContact,
        whatsapp: data.whatsapp,
        phone: data.phone,
        authorId: user.uid,
      });
      setRequestId(id);
      setStage('done');
      return;
    }

    // Preview path — we own all state transitions from here
    setPendingData(data);
    setStage('checking');

    try {
      const previewRequest: HelpRequest = {
        id: '__preview__',
        text: data.text,
        category: data.category as RequestCategory,
        location: data.location as StevenageArea,
        urgency: data.urgency,
        preferredContact: data.preferredContact,
        whatsapp: data.whatsapp,
        phone: data.phone,
        expiresAt: '',
        status: 'pending',
        authorId: '',
        createdAt: '',
        updatedAt: '',
      };

      const outcome = await findMatchesForRequest(previewRequest);

      if (outcome.type === 'services' && outcome.results.length > 0) {
        // Show the preview screen
        setPreviewMatches(outcome.results);
        setStage('previewing');
      } else {
        // No matches found — post immediately without interrupting the user
        await submitPost(data);
      }
    } catch {
      // Match check failed silently — never block a legitimate post
      await submitPost(data);
    }
  };

  // -------------------------------------------------------
  // Actually writes the request to Firestore
  // Used by both the "no matches" fast-path and "Post anyway"
  // -------------------------------------------------------
  async function submitPost(data: HelpRequestFormData) {
    if (!user) return;
    setStage('posting');
    setPostError('');
    try {
      const id = await createHelpRequest({
        text: data.text,
        category: (data.category as HelpRequest['category']) || null,
        location: data.location as StevenageArea,
        urgency: data.urgency,
        preferredContact: data.preferredContact,
        whatsapp: data.whatsapp,
        phone: data.phone,
        authorId: user.uid,
      });
      setRequestId(id);
      setStage('done');
    } catch (err) {
      // Return to preview screen (matches still visible) and show the error
      setPostError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStage('previewing');
    }
  }

  // -------------------------------------------------------
  // "Edit my request" — restores the form with all entered data
  // -------------------------------------------------------
  function handleEdit() {
    setFormKey((k) => k + 1); // force re-mount so defaultValues are re-applied
    setStage('form');
  }

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">

          {/* ---- Done ---- */}
          {stage === 'done' && requestId && (
            <StateMessage
              type="success"
              title="Request posted!"
              message="Your request is pending review and will be visible once approved. In the meantime, see if we can match you with a service now."
              action={
                <div className="flex flex-col gap-3">
                  <button
                    data-testid="see-matches-btn"
                    onClick={() => router.push(`/requests/${requestId}/matches`)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition min-h-[44px]"
                  >
                    See matching services
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPendingData(null);
                        setRequestId(null);
                        setFormKey((k) => k + 1);
                        setStage('form');
                      }}
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
                </div>
              }
            />
          )}

          {/* ---- Checking / posting skeleton ---- */}
          {(stage === 'checking' || stage === 'posting') && (
            <div className="space-y-3">
              <div className="h-7 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
                  <div className="h-5 w-1/2 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* ---- Preview screen ---- */}
          {stage === 'previewing' && pendingData && (
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">
                Services that might help you
              </h1>
              <p className="text-sm text-slate-600 mb-5">
                We found {previewMatches.length} service{previewMatches.length !== 1 ? 's' : ''} in
                your area that match what you need. Contact them directly, or post your request to
                the community anyway.
              </p>

              {postError && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  {postError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                {previewMatches.map((result, i) => (
                  <MatchResultCard
                    key={result.service.id}
                    result={result}
                    rank={i + 1}
                    preferredContact={pendingData.preferredContact}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  data-testid="post-anyway-btn"
                  onClick={() => submitPost(pendingData)}
                  className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition min-h-[48px]"
                >
                  Post my request anyway
                </button>
                <button
                  data-testid="edit-request-btn"
                  onClick={handleEdit}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition min-h-[48px]"
                >
                  Edit my request
                </button>
              </div>
            </div>
          )}

          {/* ---- Form ---- */}
          {stage === 'form' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Request</h1>
              <p className="text-sm text-slate-600 mb-6">
                Ask the community for help, goods, or services.
              </p>
              <HelpRequestForm
                key={formKey}
                defaultValues={pendingData ?? initialDefaults}
                onSubmit={handleSubmit}
              />
            </>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}
