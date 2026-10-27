import { useEffect, useState } from 'react';
import * as availabilityService from '../services/availabilityService';
import { ApiError } from '../services/apiClient';
import type { AvailabilityWindow } from '../types/availability';

export function useAvailability() {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return { windows, error };
}
