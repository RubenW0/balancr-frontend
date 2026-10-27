import { useCallback, useRef, useState } from 'react';
import * as fixedEventService from '../services/fixedEventService';
import { ApiError } from '../services/apiClient';
import type { CreateFixedEventPayload, FixedEvent, FixedEventRange } from '../types/fixedEvent';

/**
 * Fixed events for the range the calendar currently shows. Call setRange
 * whenever the visible week changes; the events are fetched again then and
 * after every create/update/delete.
 */
export function useWeekFixedEvents() {
  const rangeRef = useRef<FixedEventRange | null>(null);
  const [hasRange, setHasRange] = useState(false);
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only the latest request may update state, so fast navigation can't show an older week.
  const latestRequest = useRef(0);

  const load = useCallback(async (loadRange: FixedEventRange) => {
    const request = ++latestRequest.current;
    setIsLoading(true);
    setError(null);
    try {
      const events = await fixedEventService.getFixedEvents(loadRange);
      if (request === latestRequest.current) setFixedEvents(events);
    } catch (err) {
      if (request === latestRequest.current) {
        setFixedEvents([]);
        setError(err instanceof ApiError ? err.message : 'Unknown error while loading fixed events.');
      }
    } finally {
      if (request === latestRequest.current) setIsLoading(false);
    }
  }, []);

  const setRange = useCallback(
    (next: FixedEventRange) => {
      const prev = rangeRef.current;
      if (prev && prev.from === next.from && prev.to === next.to) return;
      rangeRef.current = next;
      setHasRange(true);
      load(next);
    },
    [load],
  );

  const reload = useCallback(async () => {
    if (rangeRef.current) await load(rangeRef.current);
  }, [load]);

  // Save errors are thrown to the caller (the dialog shows them), not stored here.
  const addFixedEvent = useCallback(
    async (payload: CreateFixedEventPayload) => {
      await fixedEventService.createFixedEvent(payload);
      await reload();
    },
    [reload],
  );

  const updateFixedEvent = useCallback(
    async (id: number, payload: CreateFixedEventPayload) => {
      await fixedEventService.updateFixedEvent(id, payload);
      await reload();
    },
    [reload],
  );

  const deleteFixedEvent = useCallback(
    async (id: number) => {
      await fixedEventService.deleteFixedEvent(id);
      await reload();
    },
    [reload],
  );

  return {
    fixedEvents,
    isLoading,
    error,
    hasRange,
    setRange,
    reload,
    addFixedEvent,
    updateFixedEvent,
    deleteFixedEvent,
  };
}
