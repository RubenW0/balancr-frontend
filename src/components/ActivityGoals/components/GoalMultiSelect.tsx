import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ActivityGoalResponseDTO } from '../../../types/activityGoal';
import '../styles/GoalMultiSelect.css';

export type GoalOption = Pick<ActivityGoalResponseDTO, 'id' | 'name' | 'type'>;

interface GoalMultiSelectProps {
  /** id of the trigger button, so a <label htmlFor> names the field. */
  id: string;
  /** Goals that can be picked, in display order. */
  options: GoalOption[];
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
  'aria-describedby'?: string;
}

// Enough room for the dropdown below the field; otherwise it opens upwards when there is more room there.
const DROPDOWN_SPACE = 250;

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 6.25l2.25 2.25 4.75-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Field that picks several goals: the selection as removable chips, and a dropdown
 * listbox with a checkbox per goal. Arrow keys move, Space/Enter toggle, Esc, Tab or
 * a click outside close it.
 */
export function GoalMultiSelect({ id, options, value, onChange, disabled, ...rest }: GoalMultiSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [opensUp, setOpensUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const isEmpty = options.length === 0;
  const isDisabled = disabled || isEmpty;
  const selected = options.filter((option) => value.includes(option.id));

  // Click outside closes the dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  // Keeps the active row visible while moving with the arrow keys.
  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [isOpen, activeIndex]);

  const open = () => {
    if (isDisabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    // Inside a dialog the dialog's own edge clips the dropdown, not the window's.
    const bounds = rootRef.current?.closest('dialog')?.getBoundingClientRect();
    const bottom = bounds?.bottom ?? window.innerHeight;
    const top = bounds?.top ?? 0;
    setOpensUp(rect ? bottom - rect.bottom < DROPDOWN_SPACE && rect.top - top > bottom - rect.bottom : false);
    const firstSelected = options.findIndex((option) => value.includes(option.id));
    setActiveIndex(Math.max(firstSelected, 0));
    setIsOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const toggle = (goalId: number) => {
    const next = value.includes(goalId) ? value.filter((v) => v !== goalId) : [...value, goalId];
    // Sorted like the API returns it, so selecting and deselecting again is not a change.
    onChange(next.sort((a, b) => a - b));
  };

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  };

  const handleListKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (options[activeIndex]) toggle(options[activeIndex].id);
        break;
      case 'Escape':
        // Only the dropdown closes, not the dialog around it.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        // Focus moves on to the next field as usual.
        close(false);
        break;
    }
  };

  return (
    <div className="goal-select" ref={rootRef}>
      <div
        className={`goal-select-control${isOpen ? ' goal-select-control--open' : ''}${isDisabled ? ' goal-select-control--disabled' : ''}`}
        onClick={(event) => {
          // Clicks on a chip's remove button only remove that chip.
          if ((event.target as HTMLElement).closest('.goal-select-chip-remove')) return;
          if (isOpen) close(true);
          else open();
        }}
      >
        {selected.map((goal) => (
          <span key={goal.id} className={`goal-select-chip goal-select-type--${goal.type.toLowerCase()}`}>
            <span className="goal-select-dot" aria-hidden="true" />
            <span className="goal-select-chip-name">{goal.name}</span>
            <button
              type="button"
              className="goal-select-chip-remove"
              onClick={() => toggle(goal.id)}
              aria-label={`Remove ${goal.name}`}
              disabled={disabled}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className="goal-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          onKeyDown={handleTriggerKeyDown}
          disabled={isDisabled}
          aria-describedby={rest['aria-describedby']}
        >
          {isEmpty ? (
            <span className="goal-select-placeholder">Add another goal first</span>
          ) : (
            selected.length === 0 && <span className="goal-select-placeholder">None</span>
          )}
          <svg className="goal-select-chevron" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          className={`goal-select-list${opensUp ? ' goal-select-list--up' : ''}`}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={id}
          aria-activedescendant={`${listId}-${activeIndex}`}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
        >
          {options.map((goal, index) => {
            const isSelected = value.includes(goal.id);
            return (
              <li
                key={goal.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`goal-select-option goal-select-type--${goal.type.toLowerCase()}${index === activeIndex ? ' goal-select-option--active' : ''}`}
                // Keeps the focus on the list, so the keyboard keeps working after a click.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  setActiveIndex(index);
                  toggle(goal.id);
                }}
              >
                <span className="goal-select-checkbox" aria-hidden="true">
                  {isSelected && <CheckIcon />}
                </span>
                <span className="goal-select-dot" aria-hidden="true" />
                <span className="goal-select-option-name">{goal.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
