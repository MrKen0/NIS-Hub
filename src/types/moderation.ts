/**
 * Moderation Types — audit log for all admin actions
 * ----------------------------------------------------
 * Every moderation action (content status change, user role/status change)
 * is logged as an immutable document in the `moderationActions` collection.
 */

export type ModerationActionType =
  | 'approve'
  | 'reject'
  | 'pause'
  | 'archive'
  | 'restore'
  | 'role_change'
  | 'team_assignment';

export type ModerationTargetType =
  | 'productListing'
  | 'serviceListing'
  | 'event'
  | 'notice'
  | 'request'
  | 'user';

export interface ModerationAction {
  id: string;
  actionType: ModerationActionType;
  targetType: ModerationTargetType;
  targetId: string;
  fieldChanged: string;      // e.g. 'status', 'role'
  previousValue: string;     // e.g. 'pending', 'member'
  newValue: string;          // e.g. 'approved', 'provider'
  moderatorId: string;
  moderatorName: string;
  reason?: string;
  createdAt: string;
}
