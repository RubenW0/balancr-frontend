import { useCallback, useEffect, useState } from 'react';
import * as availabilityService from '../services/availabilityService';
import { ApiError } from '../services/apiClient';
import type { AvailabilityWindow } from '../types/availability';

export function useAvailability() {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Bumped by reload to fetch again.
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    availabilityService
      .getAvailability()
      .then((data) => {
        if (isCurrent) setWindows(data);
      })
      .catch((err) => {
        if (isCurrent) {
          setError(err instanceof ApiError ? err.message : 'Unknown error while loading availability.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRequestKey((key) => key + 1);
  }, []);

  return { windows, setWindows, error, isLoading, reload };
}
