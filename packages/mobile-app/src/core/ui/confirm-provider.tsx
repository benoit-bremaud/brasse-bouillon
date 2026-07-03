import React from "react";

import { ConfirmDialog } from "@/core/ui/ConfirmDialog";

export type ConfirmOptions = Readonly<{
  title: string;
  message?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}>;

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/**
 * Hosts the single branded confirmation dialog and exposes an imperative
 * `confirm()` that resolves to the user's choice — so call sites migrate from
 * `Alert.alert(title, msg, [cancel, confirm])` to
 * `if (await confirm({ … })) { … }` with minimal churn, while the UI stays on
 * the app's charte. Mounted once near the app root.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      // Re-entrancy: if a dialog is already pending, settle its promise as
      // declined before replacing it — never leak the previous caller's
      // promise (a double-tap or two racing flows would otherwise hang).
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const settle = React.useCallback((value: boolean) => {
    setOptions(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(value);
  }, []);

  // Resolve any still-pending promise as declined if the provider unmounts,
  // so a caller awaiting confirm() never hangs forever.
  React.useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        visible={options !== null}
        title={options?.title ?? ""}
        message={options?.message}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        destructive={options?.destructive}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Imperative confirmation: `const confirm = useConfirm(); if (await confirm({…}))`.
 * Throws if used outside a `ConfirmProvider` (a wiring bug, caught in dev/tests).
 */
export function useConfirm(): ConfirmFn {
  const confirm = React.useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return confirm;
}
