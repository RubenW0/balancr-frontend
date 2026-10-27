import { useLayoutEffect, useRef, useState } from 'react';
import type { UnscheduledReason, UnscheduledSessionDTO } from '../../../types/plan';
import '../styles/Plan.css';

interface UnscheduledListProps {
  sessions: UnscheduledSessionDTO[];
}

const REASON_LABELS: Record<UnscheduledReason, string> = {
  NO_FREE_BLOCK: 'No free block long enough',
  NO_VALID_SLOT: 'Rest rule or other rules leave no valid moment',
};

/** Slim warning bar under the calendar's top bar; collapsed to two lines with a toggle when it is longer. */
export function UnscheduledList({ sessions }: UnscheduledListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => setIsOverflowing(list.scrollHeight > list.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [sessions]);

  return (
    <section className="unscheduled" aria-labelledby="unscheduled-title">
      <h2 id="unscheduled-title" className="unscheduled-title">
        {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} could not be scheduled
      </h2>
      <ul ref={listRef} className={`unscheduled-list${isExpanded ? ' unscheduled-list--expanded' : ''}`}>
        {sessions.map((session) => (
          <li key={`${session.goalId}-${session.sessionNumber}`} className="unscheduled-item">
            <span className="unscheduled-name">
              {session.goalName} #{session.sessionNumber}
            </span>
            {' · '}
            {REASON_LABELS[session.reason] ?? session.reason}
          </li>
        ))}
      </ul>
      {(isOverflowing || isExpanded) && (
        <button
          type="button"
          className="unscheduled-toggle"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? 'Less' : 'More'}
        </button>
      )}
    </section>
  );
}
