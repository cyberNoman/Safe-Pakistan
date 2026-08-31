/**
 * AppContext — global app state (scan counters, analyzing flag).
 * Usage: const { scanCount, incrementScan } = useAppContext();
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [scanCount, setScanCount] = useState(312);
  const [blockedCount, setBlockedCount] = useState(47);
  const [savedAmount, setSavedAmount] = useState(120000);
  const [recentScans, setRecentScans] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const incrementScan = useCallback(() => {
    setScanCount(c => c + 1);
  }, []);

  // Keep the feed short — the Library screen is the full history.
  const addScan = useCallback(scan => {
    setRecentScans(prev => [scan, ...prev].slice(0, 20));
  }, []);

  const value = useMemo(() => ({
    scanCount, blockedCount, savedAmount, recentScans, isAnalyzing,
    incrementScan, addScan, setIsAnalyzing,
  }), [scanCount, blockedCount, savedAmount, recentScans, isAnalyzing, incrementScan, addScan]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Default object keeps screens crash-free if rendered outside the provider.
export function useAppContext() {
  return useContext(AppContext) || {};
}
