import { useCallback, useEffect, useState } from 'react';
import * as fixedEventService from '../services/fixedEventService';
import { ApiError } from '../services/apiClient';
import type { CreateFixedEventPayload, FixedEvent } from '../types/fixedEvent';

export function useFixedEvents() {
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setFixedEvents(await fixedEventService.getFixedEvents());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unknown error while loading fixed events.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addFixedEvent = useCallback(async (payload: CreateFixedEventPayload) => {
    setError(null);
    try {
      const created = await fixedEventService.createFixedEvent(payload);
      setFixedEvents((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unknown error while creating the fixed event.');
      throw err;
    }
  }, []);

  return { fixedEvents, isLoading, error, reload: load, addFixedEvent };
}
