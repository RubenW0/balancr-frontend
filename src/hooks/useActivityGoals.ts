import { useCallback, useEffect, useState } from 'react';
import * as activityGoalService from '../services/activityGoalService';
import { ApiError } from '../services/apiClient';
import type { ActivityGoalRequestDTO, ActivityGoalResponseDTO } from '../types/activityGoal';

const GOAL_GONE_MESSAGE =
  'This activity goal no longer exists (it may have been deleted elsewhere). The list has been refreshed.';

export function useActivityGoals() {
  const [activityGoals, setActivityGoals] = useState<ActivityGoalResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setActivityGoals(await activityGoalService.getActivityGoals());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unknown error while loading activity goals.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * A 404 means the goal is gone: refresh the list, show a notice above it and
   * resolve, so the dialog closes. Any other error is thrown to the caller,
   * which shows it in the form.
   */
  const handleGoneGoal = useCallback(
    async (err: unknown) => {
      if (!(err instanceof ApiError) || err.status !== 404) throw err;
      await load();
      setError(GOAL_GONE_MESSAGE);
    },
    [load],
  );

  // Save errors are thrown to the caller (the form shows them), not stored here.
  const addActivityGoal = useCallback(
    async (payload: ActivityGoalRequestDTO) => {
      await activityGoalService.createActivityGoal(payload);
      await load();
    },
    [load],
  );

  const updateActivityGoal = useCallback(
    async (id: number, payload: ActivityGoalRequestDTO) => {
      try {
        await activityGoalService.updateActivityGoal(id, payload);
      } catch (err) {
        await handleGoneGoal(err);
        return;
      }
      await load();
    },
    [load, handleGoneGoal],
  );

  const deleteActivityGoal = useCallback(
    async (id: number) => {
      try {
        await activityGoalService.deleteActivityGoal(id);
      } catch (err) {
        await handleGoneGoal(err);
        return;
      }
      await load();
    },
    [load, handleGoneGoal],
  );

  return {
    activityGoals,
    isLoading,
    error,
    reload: load,
    addActivityGoal,
    updateActivityGoal,
    deleteActivityGoal,
  };
}
