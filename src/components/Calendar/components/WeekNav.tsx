import '../styles/WeekNav.css';

interface WeekNavProps {
  title: string;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Previous/next week, "Today" and the visible week, shown above the calendar. */
export function WeekNav({ title, isCurrentWeek, onPrev, onNext, onToday }: WeekNavProps) {
  return (
    <div className="week-nav">
      <div className="week-nav-buttons">
        <button type="button" className="button button--secondary week-nav-arrow" onClick={onPrev} aria-label="Previous week">
          <Chevron direction="left" />
        </button>
        <button type="button" className="button button--secondary week-nav-arrow" onClick={onNext} aria-label="Next week">
          <Chevron direction="right" />
        </button>
      </div>
      <button type="button" className="button button--secondary week-nav-today" onClick={onToday} disabled={isCurrentWeek}>
        Today
      </button>
      <h2 className="week-nav-title" aria-live="polite">
        {title}
      </h2>
    </div>
  );
}
