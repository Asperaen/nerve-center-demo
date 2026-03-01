import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LiveInsightContextValue {
  liveInsightOn: boolean;
  setLiveInsightOn?: (on: boolean) => void;
}

const LiveInsightContext = createContext<LiveInsightContextValue | undefined>(undefined);

export function LiveInsightProvider({ children }: { children: ReactNode }) {
  const [liveInsightOn, setLiveInsightOn] = useState(false);
  const value: LiveInsightContextValue = {
    liveInsightOn,
    setLiveInsightOn: useCallback((on: boolean) => setLiveInsightOn(on), []),
  };
  return (
    <LiveInsightContext.Provider value={value}>
      {children}
    </LiveInsightContext.Provider>
  );
}

export function useLiveInsight(): LiveInsightContextValue {
  const ctx = useContext(LiveInsightContext);
  if (ctx === undefined) {
    return { liveInsightOn: false };
  }
  return ctx;
}
