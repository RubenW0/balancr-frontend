import { describe, expect, it } from 'vitest';
import { PRIORITY_OPTIONS, levelToPriority, priorityToLevel } from './priorityOptions';

describe('priority mapping', () => {
  it('maps the labels so that a higher number is planned first', () => {
    expect(PRIORITY_OPTIONS.map((o) => [o.label, o.value])).toEqual([
      ['High', 3],
      ['Normal', 2],
      ['Low', 1],
    ]);
  });

  it('reads API numbers as levels, clamping values outside 1-3', () => {
    expect(priorityToLevel(5)).toBe('HIGH');
    expect(priorityToLevel(3)).toBe('HIGH');
    expect(priorityToLevel(2)).toBe('NORMAL');
    expect(priorityToLevel(1)).toBe('LOW');
    expect(priorityToLevel(0)).toBe('LOW');
  });

  it('writes the standard number for a new or changed level', () => {
    expect(levelToPriority('HIGH')).toBe(3);
    expect(levelToPriority('NORMAL')).toBe(2);
    expect(levelToPriority('LOW')).toBe(1);
    expect(levelToPriority('LOW', 3)).toBe(1);
  });

  it('keeps the original number when the level did not change', () => {
    expect(levelToPriority('HIGH', 5)).toBe(5);
    expect(levelToPriority('LOW', 0)).toBe(0);
    expect(levelToPriority('NORMAL', 2)).toBe(2);
  });
});
