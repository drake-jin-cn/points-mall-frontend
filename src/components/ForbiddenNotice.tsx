export interface ForbiddenNoticeProps {
  message?: string;
}

/**
 * In-place (non-navigating) permission-denied notice used as a RequirePermission `fallback`.
 * Distinct from `app/403/page.tsx`, which is a full-page route used by the middleware's
 * route-level (Level 1) redirect.
 */
export function ForbiddenNotice({
  message = "You don't have permission to view this section.",
}: ForbiddenNoticeProps) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
      {message}
    </div>
  );
}
