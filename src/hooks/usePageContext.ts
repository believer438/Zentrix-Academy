import { useEffect } from "react";

export interface PageContextData {
  current_page: string;
  page_title: string;
  page_data: Record<string, unknown>;
}

const _pageContextRef = { current: null as PageContextData | null };

export function useSetPageContext(ctx: PageContextData) {
  useEffect(() => {
    _pageContextRef.current = ctx;
    // No cleanup — the ref must stay set when the user sends a message.
    // The next page will overwrite it. Only DashboardLayout unmount clears it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ctx)]);
}

export function clearPageContext() {
  _pageContextRef.current = null;
}

export function getPageContext(): PageContextData | null {
  return _pageContextRef.current;
}
