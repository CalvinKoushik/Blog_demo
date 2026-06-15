"use client";

import { sanitizeHtml } from "@/lib/sanitize";

export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safe = sanitizeHtml(html);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
