/**
 * AppContext — global app state derived from the real local scan store.
 *
 * DEMO-CREDIBILITY: counters start at 0 and are computed ONLY from
 * LocalDBService (AsyncStorage). No hardcoded seed numbers, no back-fill.
 * An empty store stays empty → screens show their clean empty state.
 *
 * Usage: const { scanCount, blockedCount, recordScan } = useAppContext();
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LocalDBService, computeStats } from '@/services/LocalDBService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [scans, setScans] = useState([]); // real history, newest first
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load the real store on mount. Empty store → [].
  const reload = useCallback(async () => {
    const history = await LocalDBService.getScanHistory();
    setScans(history);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Persist a scan, then refresh in-memory state so Home / Report / Library update.
  const recordScan = useCallback(async (scan) => {
    const next = await LocalDBService.saveScan(scan);
    setScans(next);
    return next;
  }, []);

  const stats = useMemo(() => computeStats(scans), [scans]);

  const value = useMemo(() => ({
    scans,
    recentScans: scans.slice(0, 5),
    scanCount: stats.scanCount,
    blockedCount: stats.blockedCount,
    safeCount: stats.safeCount,
    suspiciousCount: stats.suspiciousCount,
    savedAmount: stats.savedAmount,
    isAnalyzing, setIsAnalyzing,
    recordScan, reload,
  }), [scans, stats, isAnalyzing, recordScan, reload]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Default object keeps screens crash-free if rendered outside the provider.
export function useAppContext() {
  return useContext(AppContext) || {};
}
