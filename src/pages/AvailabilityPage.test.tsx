import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as availabilityService from '../services/availabilityService';
import type { AvailabilityWindow, DayOfWeek } from '../types/availability';
import { AvailabilityPage } from './AvailabilityPage';

vi.mock('../services/availabilityService', () => ({
  getAvailability: vi.fn(),
  saveAvailability: vi.fn(),
}));

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function week(overrides: Partial<Record<DayOfWeek, Partial<AvailabilityWindow>>> = {}): AvailabilityWindow[] {
  return DAYS.map((dayOfWeek, index) => ({
    id: index + 1,
    dayOfWeek,
    startTime: '08:00:00',
    endTime: '22:00:00',
    closed: false,
    userId: 1,
    ...overrides[dayOfWeek],
  }));
}

async function renderPage(windows: AvailabilityWindow[], initialEntries = ['/availability']) {
  vi.mocked(availabilityService.getAvailability).mockResolvedValue(windows);
  // Echoes the saved week back, like the server does for open days.
  vi.mocked(availabilityService.saveAvailability).mockImplementation(async (body) =>
    body.map((day, index) => ({ ...day, id: index + 1, userId: 1 })),
  );
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/calendar" element={<p>Calendar page</p>} />
        <Route path="/goals" element={<p>Goals page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole('button', { name: 'Save' });
}

const savedBody = () => vi.mocked(availabilityService.saveAvailability).mock.calls[0][0];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AvailabilityPage simple mode', () => {
  it('is shown when every day is open with the same hours, and saves them for all 7 days', async () => {
    await renderPage(week());
    expect(screen.getByText('Plan between')).toBeTruthy();
    expect(screen.getByText('98h available per week')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '17:30' } });
    expect(screen.getByText('59.5h available per week')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('Availability saved.');
    expect(savedBody()).toEqual(
      DAYS.map((dayOfWeek) => ({ dayOfWeek, startTime: '09:00:00', endTime: '17:30:00', closed: false })),
    );
    // The page keeps its state after saving.
    expect(screen.getByText('Plan between')).toBeTruthy();
  });

  it('switches to per day and back while all days are still the same', async () => {
    await renderPage(week());
    fireEvent.click(screen.getByRole('button', { name: 'Customise per day' }));
    expect(screen.getAllByRole('switch')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: 'Back to simple' }));
    expect(screen.getByText('Plan between')).toBeTruthy();
  });
});

describe('AvailabilityPage per-day mode', () => {
  it('is shown when the days differ, and hides "Back to simple" then', async () => {
    await renderPage(week({ SATURDAY: { startTime: '10:00:00' } }));
    expect(screen.queryByText('Plan between')).toBeNull();
    expect(screen.getAllByRole('switch')).toHaveLength(7);
    expect(screen.queryByRole('button', { name: 'Back to simple' })).toBeNull();
  });

  it('is shown when a day is closed, with that row dimmed and its inputs disabled', async () => {
    await renderPage(week({ SUNDAY: { closed: true } }));
    const sunday = screen.getByRole('switch', { name: 'Plan on Sunday' });
    expect(sunday.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('No planning on this day')).toBeTruthy();
    expect((screen.getByLabelText('Sunday start time') as HTMLInputElement).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Back to simple' })).toBeNull();
  });

  it('keeps the times of a day that is switched off and on again', async () => {
    await renderPage(week({ MONDAY: { startTime: '07:30:00' } }));
    fireEvent.change(screen.getByLabelText('Tuesday end time'), { target: { value: '18:15' } });

    const tuesday = screen.getByRole('switch', { name: 'Plan on Tuesday' });
    fireEvent.click(tuesday);
    expect(tuesday.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(tuesday);

    expect(tuesday.getAttribute('aria-checked')).toBe('true');
    expect((screen.getByLabelText('Tuesday start time') as HTMLInputElement).value).toBe('08:00');
    expect((screen.getByLabelText('Tuesday end time') as HTMLInputElement).value).toBe('18:15');
  });

  it('counts only open days in the weekly total', async () => {
    await renderPage(week({ SATURDAY: { closed: true }, SUNDAY: { closed: true } }));
    expect(screen.getByText('70h available per week')).toBeTruthy();

    fireEvent.click(screen.getByRole('switch', { name: 'Plan on Friday' }));
    expect(screen.getByText('56h available per week')).toBeTruthy();
  });

  it('validates open days only and sends all 7 days with closed, keeping closed days their times', async () => {
    await renderPage(week({ SUNDAY: { closed: true } }));
    fireEvent.change(screen.getByLabelText('Sunday end time'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Monday end time'), { target: { value: '07:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getAllByText('End time must be after start time.')).toHaveLength(1);
    expect(availabilityService.saveAvailability).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('switch', { name: 'Plan on Monday' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Availability saved.');

    const body = savedBody();
    expect(body).toHaveLength(7);
    expect(body.map((day) => day.dayOfWeek)).toEqual(DAYS);
    expect(body.every((day) => typeof day.closed === 'boolean')).toBe(true);
    expect(body[0]).toEqual({ dayOfWeek: 'MONDAY', startTime: '08:00:00', endTime: '07:00:00', closed: true });
    expect(body[1]).toEqual({ dayOfWeek: 'TUESDAY', startTime: '08:00:00', endTime: '22:00:00', closed: false });
  });

  it('warns when every day is closed', async () => {
    const allClosed = Object.fromEntries(DAYS.map((day) => [day, { closed: true }]));
    await renderPage(week(allClosed));
    expect(screen.getByText('All days are closed, nothing can be planned.')).toBeTruthy();
    expect(screen.getByText('0h available per week')).toBeTruthy();

    fireEvent.click(screen.getByRole('switch', { name: 'Plan on Monday' }));
    await waitFor(() => expect(screen.queryByText('All days are closed, nothing can be planned.')).toBeNull());
  });
});

describe('AvailabilityPage back button', () => {
  it('goes to the calendar when there is no previous page in the app', async () => {
    await renderPage(week());
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Calendar page')).toBeTruthy();
  });

  it('goes back to the page it was opened from', async () => {
    vi.mocked(availabilityService.getAvailability).mockResolvedValue(week());
    render(
      <MemoryRouter initialEntries={['/goals']}>
        <Routes>
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/goals" element={<Link to="/availability">Open availability</Link>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Open availability' }));
    await screen.findByRole('button', { name: 'Save' });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('link', { name: 'Open availability' })).toBeTruthy();
  });
});
