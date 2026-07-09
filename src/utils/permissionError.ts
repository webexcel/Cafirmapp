/**
 * Returns true when an error is an HTTP 403 (Forbidden) — i.e. the request was
 * authenticated but the account lacks permission for that endpoint.
 *
 * We gate the Attendance / Timesheet widgets on this server signal rather than
 * on the permission menu tree: the backend gates those endpoints on menu names
 * ("Attendance", "Work Timesheet") that don't line up with the tree's
 * "Add/View Attendance" / "TimeSheet" entries, so the tree can't reliably
 * predict access. The 403 is the authoritative permission decision.
 */
export const isForbidden = (error: unknown): boolean =>
  (error as any)?.response?.status === 403;
