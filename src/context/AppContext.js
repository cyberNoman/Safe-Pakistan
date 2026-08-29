/**
 * AppContext — global app state for Safe Pakistan.
 * Contract (AGENTS.md): scanCount, blockedCount, isAnalyzing, incrementScan.
 * Screens consume via `useAppContext()`; providers are wired in App.js.
 */
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [scanCount, setScanCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Call after each completed scan; pass `true` when the verdict was SCAM.
  const incrementScan = useCallback((blocked = false) => {
    setScanCount(c => c + 1);
    if (blocked) setBlockedCount(c => c + 1);
  }, []);

  const value = useMemo(() => ({
    scanCount,
    blockedCount,
    isAnalyzing,
    setIsAnalyzing,
    incrementScan,
  }), [scanCount, blockedCount, isAnalyzing, incrementScan]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
