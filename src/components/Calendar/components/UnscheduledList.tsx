import type { UnscheduledReason, UnscheduledSessionDTO } from '../../../types/plan';
import '../styles/Plan.css';

interface UnscheduledListProps {
  sessions: UnscheduledSessionDTO[];
}

const REASON_LABELS: Record<UnscheduledReason, string> = {
  NO_FREE_BLOCK: 'No free block long enough',
  NO_VALID_SLOT: 'Rest rule or other rules leave no valid moment',
};

export function UnscheduledList({ sessions }: UnscheduledListProps) {
  return (
    <section className="unscheduled" aria-labelledby="unscheduled-title">
      <h2 id="unscheduled-title">Could not be scheduled</h2>
      {sessions.length === 0 ? (
        <p className="unscheduled-empty">Everything fits.</p>
      ) : (
        <ul className="unscheduled-list">
          {sessions.map((session) => (
            <li key={`${session.goalId}-${session.sessionNumber}`} className="unscheduled-item">
              <span className="unscheduled-name">
                {session.goalName} #{session.sessionNumber}
              </span>
              <span className="unscheduled-reason">
                {REASON_LABELS[session.reason] ?? session.reason}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
