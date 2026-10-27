import { useCallback, useRef, useState } from 'react';
import * as planService from '../services/planService';
import { ApiError } from '../services/apiClient';
import type { PlanResponseDTO } from '../types/plan';

/**
 * A plan preview for one week. It only lives in memory: clearPlan drops it,
 * and also discards a request that is still running.
 */
export function usePlan() {
  const [plan, setPlan] = useState<PlanResponseDTO | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only the latest request may update state; clearPlan bumps it so a late answer is ignored.
  const latestRequest = useRef(0);

  const requestPlan = useCallback(async (weekStart: string) => {
    const request = ++latestRequest.current;
    setIsPlanning(true);
    setError(null);
    setPlan(null);
    try {
      const result = await planService.createPlan({ weekStart });
      if (request === latestRequest.current) setPlan(result);
    } catch (err) {
      if (request === latestRequest.current) {
        setError(err instanceof ApiError ? err.message : 'Unknown error while planning the week.');
      }
    } finally {
      if (request === latestRequest.current) setIsPlanning(false);
    }
  }, []);

  const clearPlan = useCallback(() => {
    latestRequest.current++;
    setPlan(null);
    setError(null);
    setIsPlanning(false);
  }, []);

  return { plan, isPlanning, error, requestPlan, clearPlan };
}
