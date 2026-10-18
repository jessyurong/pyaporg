import { useCallback, useRef, useState } from "react";

/**
 * Synchronous re-entry guard para sa save / approve / submit buttons.
 *
 * Bakit hindi sapat ang `useState` busy flag: kapag mahina ang signal at
 * mabilis ang double-tap, nakakapasok ang pangalawang click bago pa
 * ma-render ang `disabled` state -> dalawang request -> duplicate records
 * (events, members, atbp.).
 *
 * Ang `useRef` lock ay naka-set agad sa unang click, synchronously, bago
 * pa mag-render — kaya ligtas sa duplicate.
 *
 *   const { run, isBusy } = useSubmitLock();
 *   <button disabled={isBusy()} onClick={() => run(null, () => onSave(data))}>
 *     {isBusy() ? "Saving…" : "Save"}
 *   </button>
 *
 * Pwede ring i-key (hal. per user id) para hindi ma-block ang ibang row:
 *   disabled={isBusy(u.user_id)} onClick={() => run(u.user_id, () => onApprove(u.user_id))}
 */
const SINGLE_KEY = "__single__";

export function useSubmitLock() {
  const lockedRef = useRef(new Set());
  const [busyKeys, setBusyKeys] = useState(() => new Set());

  const run = useCallback(async (key, fn) => {
    const k = key == null ? SINGLE_KEY : String(key);
    if (lockedRef.current.has(k)) return undefined;
    lockedRef.current.add(k);
    setBusyKeys(new Set(lockedRef.current));
    try {
      return await fn();
    } finally {
      lockedRef.current.delete(k);
      setBusyKeys(new Set(lockedRef.current));
    }
  }, []);

  const isBusy = useCallback((key) => busyKeys.has(key == null ? SINGLE_KEY : String(key)), [busyKeys]);

  return { run, isBusy };
}

/** Shared button classes para pantay ang disabled state sa lahat ng form. */
export const submittingCls = "disabled:opacity-60 disabled:cursor-not-allowed";
