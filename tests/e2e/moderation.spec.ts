import { test, expect } from '@playwright/test';
import { getFirstPendingCard, getFirstContentCard, getFirstMemberCard, filterByStatus } from './helpers';

test.describe('Moderation Flow', () => {
  // Moderation tests share mutable Firestore state — run sequentially to prevent
  // workers from racing over the same pending/approved cards.
  // Auth is handled by the admin storageState set in playwright.config.ts.
  test.describe.configure({ mode: 'serial' });

  test('Admin can approve a pending service listing', async ({ page }) => {
    // -------------------------------------------------------
    // PREREQUISITE: At least one service listing with
    // status "pending" must exist in Firestore.
    // Create one via /create/service before running this test.
    // -------------------------------------------------------

    // Step 1–4: Go to admin → Services tab → filter to Pending
    // and grab the first visible card.
    // getFirstPendingCard handles navigation, filtering, and
    // will fail clearly if no pending listings exist.
    const card = await getFirstPendingCard(page);

    // Step 5: Capture the card's title text so we can find the
    // same item later after the filter changes.
    const title = await card.getByTestId('card-title').innerText();
    expect(title.length).toBeGreaterThan(0);

    // Step 6: Verify the card currently shows PENDING status.
    // This confirms we are acting on the right item.
    const chipBefore = card.getByTestId('status-chip');
    await expect(chipBefore).toHaveText('PENDING');

    // Step 7: Click the Approve button *inside this specific card*
    // (scoped to the card locator so we don't accidentally click
    // a button on a different card).
    await card.getByTestId('approve-btn').click();

    // Step 8: After approval the panel reloads. The card should
    // now show APPROVED status. We re-locate the card by its
    // title because the list has re-rendered.
    // First, switch the filter to "All" so the freshly-approved
    // item is still visible (it's no longer "pending").
    await filterByStatus(page, 'all');

    // Find the card that has our title and verify its status chip.
    const allCards = page.getByTestId('content-card');
    const approvedCard = allCards.filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(approvedCard).toBeVisible();
    await expect(approvedCard.getByTestId('status-chip')).toHaveText('APPROVED');

    // Step 9–10: Switch to the Approved filter and confirm
    // the same item appears in the approved-only list.
    await filterByStatus(page, 'approved');

    const approvedList = page.getByTestId('content-card');
    const itemInApproved = approvedList.filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(itemInApproved).toBeVisible();
    await expect(itemInApproved.getByTestId('status-chip')).toHaveText('APPROVED');
  });

  test('Admin can reject a service listing with a reason', async ({ page }) => {
    // -------------------------------------------------------
    // PREREQUISITE: At least one service listing with
    // status "pending" must exist in Firestore.
    // Create one via /create/service before running this test.
    // -------------------------------------------------------

    // Step 1–3: Go to admin → Services tab → filter to Pending.
    const card = await getFirstPendingCard(page);

    // Step 4: Capture the title so we can re-find this item later.
    const title = await card.getByTestId('card-title').innerText();
    expect(title.length).toBeGreaterThan(0);

    // Verify the card currently shows PENDING.
    await expect(card.getByTestId('status-chip')).toHaveText('PENDING');

    // Step 5: Click the Reject button scoped to this specific card.
    await card.getByTestId('reject-btn').click();

    // Step 6: The confirmation dialog should now be visible.
    const dialog = page.getByTestId('confirm-dialog');
    await expect(dialog).toBeVisible();

    // Step 7: Verify the reason input exists inside the dialog.
    const reasonInput = dialog.getByTestId('reason-input');
    await expect(reasonInput).toBeVisible();

    // Step 8: Type the rejection reason.
    await reasonInput.fill('Test rejection reason');

    // Step 9: Click the confirm button inside the dialog.
    await dialog.getByTestId('dialog-confirm').click();

    // The dialog should close after confirming.
    await expect(dialog).toBeHidden();

    // Step 10: The panel reloads after rejection. Switch to "All"
    // filter to find the card regardless of its new status.
    await filterByStatus(page, 'all');

    const rejectedCard = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(rejectedCard).toBeVisible();
    await expect(rejectedCard.getByTestId('status-chip')).toHaveText('REJECTED');

    // Step 11–12: Switch to the Rejected filter and confirm
    // the same item appears in the rejected-only list.
    await filterByStatus(page, 'rejected');

    const itemInRejected = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(itemInRejected).toBeVisible();
    await expect(itemInRejected.getByTestId('status-chip')).toHaveText('REJECTED');
  });

  test('Admin can pause an approved service listing', async ({ page }) => {
    // -------------------------------------------------------
    // PREREQUISITE: At least one service listing with
    // status "approved" must exist in Firestore.
    // Approve one via the admin dashboard before running this.
    // -------------------------------------------------------

    // Step 1–4: Go to admin → Services tab → filter to Approved
    // and grab the first visible card.
    const card = await getFirstContentCard(page, 'services', 'approved');

    // Step 5: Capture the title so we can re-find this item later.
    const title = await card.getByTestId('card-title').innerText();
    expect(title.length).toBeGreaterThan(0);

    // Re-anchor to a title-specific locator so the reference stays stable
    // if a Firestore subscription update re-renders the list before we click.
    const stableCard = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });

    // Verify the card currently shows APPROVED.
    await expect(stableCard.getByTestId('status-chip')).toHaveText('APPROVED');

    // Step 6: Click the Pause button scoped to this specific card.
    await stableCard.getByTestId('pause-btn').click();

    // Step 7: The confirmation dialog should appear.
    const dialog = page.getByTestId('confirm-dialog');
    await expect(dialog).toBeVisible();

    // Step 8: Type the pause reason.
    const reasonInput = dialog.getByTestId('reason-input');
    await expect(reasonInput).toBeVisible();
    await reasonInput.fill('Test pause reason');

    // Step 9: Click confirm inside the dialog.
    await dialog.getByTestId('dialog-confirm').click();

    // Dialog should close.
    await expect(dialog).toBeHidden();

    // Step 10: Switch to "All" filter and verify card shows PAUSED.
    await filterByStatus(page, 'all');

    const pausedCard = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(pausedCard).toBeVisible();
    await expect(pausedCard.getByTestId('status-chip')).toHaveText('PAUSED');

    // Step 11–12: Switch to the Paused filter and confirm
    // the same item appears there.
    await filterByStatus(page, 'paused');

    const itemInPaused = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(itemInPaused).toBeVisible();
    await expect(itemInPaused.getByTestId('status-chip')).toHaveText('PAUSED');
  });

  test('Admin can approve a pending member', async ({ page }) => {
    // -------------------------------------------------------
    // PREREQUISITE: At least one user with status "pending"
    // must exist in Firestore. Create a new account and
    // complete onboarding — all new users start as pending.
    // -------------------------------------------------------

    // Step 1–4: Go to admin → Members tab → filter to Pending
    // and grab the first visible member card.
    const card = await getFirstMemberCard(page, 'pending');

    // Step 5: Capture the member's display name so we can
    // re-find them after the list reloads.
    const name = await card.getByTestId('member-name').innerText();
    expect(name.length).toBeGreaterThan(0);

    // Verify the card currently shows PENDING status.
    await expect(card.getByTestId('status-chip')).toHaveText('PENDING');

    // Step 6: Click the Approve button scoped to this member card.
    // Member approve is instant (no confirmation dialog).
    await card.getByTestId('approve-btn').click();

    // Step 7: Switch to "All" filter and verify the member
    // now shows APPROVED.
    await filterByStatus(page, 'all');

    const approvedMember = page.getByTestId('member-card').filter({
      has: page.getByTestId('member-name').getByText(name, { exact: true }),
    });
    await expect(approvedMember).toBeVisible();
    await expect(approvedMember.getByTestId('status-chip')).toHaveText('APPROVED');

    // Step 8–9: Switch to Approved filter and confirm the
    // same member appears there.
    await filterByStatus(page, 'approved');

    const memberInApproved = page.getByTestId('member-card').filter({
      has: page.getByTestId('member-name').getByText(name, { exact: true }),
    });
    await expect(memberInApproved).toBeVisible();
    await expect(memberInApproved.getByTestId('status-chip')).toHaveText('APPROVED');
  });

  test('Admin can archive an approved service listing', async ({ page }) => {
    // -------------------------------------------------------
    // PREREQUISITE: At least one service listing with
    // status "approved" must exist in Firestore.
    // Approve one via the admin dashboard before running this.
    // -------------------------------------------------------

    // Step 1–4: Go to admin → Services tab → filter to Approved
    // and grab the first visible card.
    const card = await getFirstContentCard(page, 'services', 'approved');

    // Step 5: Capture the title so we can re-find this item later.
    const title = await card.getByTestId('card-title').innerText();
    expect(title.length).toBeGreaterThan(0);

    // Step 6: Verify the card currently shows APPROVED.
    await expect(card.getByTestId('status-chip')).toHaveText('APPROVED');

    // Step 7: Click the Archive button scoped to this specific card.
    await card.getByTestId('archive-btn').click();

    // Step 8: The confirmation dialog should appear.
    const dialog = page.getByTestId('confirm-dialog');
    await expect(dialog).toBeVisible();

    // Step 9: Type the archive reason.
    const reasonInput = dialog.getByTestId('reason-input');
    await expect(reasonInput).toBeVisible();
    await reasonInput.fill('Test archive reason');

    // Step 10: Click confirm inside the dialog.
    await dialog.getByTestId('dialog-confirm').click();

    // Dialog should close.
    await expect(dialog).toBeHidden();

    // Step 11: Switch to "All" filter and verify card shows ARCHIVED.
    await filterByStatus(page, 'all');

    const archivedCard = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(archivedCard).toBeVisible();
    await expect(archivedCard.getByTestId('status-chip')).toHaveText('ARCHIVED');

    // Step 12: Verify that no action buttons are shown on the
    // archived card (archived is a terminal state).
    await expect(archivedCard.getByTestId('approve-btn')).toBeHidden();
    await expect(archivedCard.getByTestId('reject-btn')).toBeHidden();
    await expect(archivedCard.getByTestId('pause-btn')).toBeHidden();
    await expect(archivedCard.getByTestId('archive-btn')).toBeHidden();

    // Step 13: Switch to the Archived filter and confirm
    // the same item appears there.
    await filterByStatus(page, 'archived');

    const itemInArchived = page.getByTestId('content-card').filter({
      has: page.getByTestId('card-title').getByText(title, { exact: true }),
    });
    await expect(itemInArchived).toBeVisible();
    await expect(itemInArchived.getByTestId('status-chip')).toHaveText('ARCHIVED');
  });
});
