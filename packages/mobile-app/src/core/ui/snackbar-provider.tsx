import React from "react";

import { Snackbar } from "@/core/ui/Snackbar";

export type SnackbarOptions = Readonly<{
  message: string;
  /** Optional single inline action (e.g. « Annuler » to undo). */
  actionLabel?: string;
  onAction?: () => void;
  /** Auto-dismiss delay in ms (default 5000). */
  durationMs?: number;
}>;

type ShowFn = (options: SnackbarOptions) => void;

const SnackbarContext = React.createContext<ShowFn | null>(null);

const DEFAULT_DURATION_MS = 5000;

/**
 * Hosts the single app-level snackbar and exposes an imperative `show()` — so a
 * screen can confirm an action and offer an undo (« Recette ajoutée · Annuler »)
 * without wiring transient UI itself. Mounted once near the app root, above the
 * navigator, so the snackbar survives a `router.replace` (the undo can run after
 * the originating screen has navigated away).
 */
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<SnackbarOptions | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = React.useCallback<ShowFn>(
    (opts) => {
      // Replace any visible snackbar with the newest one (and reset its timer).
      clearTimer();
      setOptions(opts);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setOptions(null);
      }, opts.durationMs ?? DEFAULT_DURATION_MS);
    },
    [clearTimer],
  );

  // Fire the action, then dismiss — so a double-tap can't run it twice.
  const handleAction = React.useCallback(() => {
    const action = options?.onAction;
    clearTimer();
    setOptions(null);
    action?.();
  }, [options, clearTimer]);

  // Never leak the auto-dismiss timer if the provider unmounts.
  React.useEffect(() => clearTimer, [clearTimer]);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      <Snackbar
        visible={options !== null}
        message={options?.message ?? ""}
        actionLabel={options?.actionLabel}
        onAction={handleAction}
      />
    </SnackbarContext.Provider>
  );
}

/**
 * Imperative snackbar: `const snackbar = useSnackbar(); snackbar({ message })`.
 * Throws if used outside a `SnackbarProvider` (a wiring bug, caught in dev/tests).
 */
export function useSnackbar(): ShowFn {
  const show = React.useContext(SnackbarContext);
  if (!show) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return show;
}
