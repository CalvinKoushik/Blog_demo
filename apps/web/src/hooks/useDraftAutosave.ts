"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DraftPayload = {
  title: string;
  content: string;
  categorySlug: string;
  postType: string;
  tags: string;
  thumbnailUrl: string;
  updatedAt: number;
};

export function useDraftAutosave(
  storageKey: string,
  data: DraftPayload,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef<string>("");
  const hydratedRef = useRef(false);

  const serialize = useCallback((d: DraftPayload) => JSON.stringify(d), []);

  useEffect(() => {
    if (!enabled) return;
    if (!hydratedRef.current) {
      initialRef.current = serialize(data);
      hydratedRef.current = true;
    } else {
      setDirty(serialize(data) !== initialRef.current);
    }
  }, [data, serialize, enabled]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      localStorage.setItem(storageKey, serialize({ ...data, updatedAt: Date.now() }));
      setLastSaved(Date.now());
    }, 1200);
    return () => clearTimeout(t);
  }, [data, dirty, storageKey, serialize]);

  const restoreDraft = useCallback((): DraftPayload | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as DraftPayload;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    initialRef.current = serialize(data);
    setDirty(false);
    setLastSaved(null);
  }, [storageKey, data, serialize]);

  const markClean = useCallback(() => {
    initialRef.current = serialize(data);
    setDirty(false);
  }, [data, serialize]);

  return { lastSaved, dirty, restoreDraft, clearDraft, markClean };
}
