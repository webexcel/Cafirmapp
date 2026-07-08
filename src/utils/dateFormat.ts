export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export const formatTimerDisplay = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Sum a list of "HH:MM" or "HH:MM:SS" duration strings into a single "HH:MM"
// total. Non-numeric / empty values are ignored. Used by the 360 summaries.
export const sumDurationsToHHMM = (durations: (string | null | undefined)[]): string => {
  let totalMinutes = 0;
  for (const d of durations) {
    if (!d) continue;
    const [h, m] = String(d).split(':');
    const hrs = parseInt(h, 10);
    const mins = parseInt(m, 10);
    if (!Number.isNaN(hrs)) totalMinutes += hrs * 60;
    if (!Number.isNaN(mins)) totalMinutes += mins;
  }
  return formatTime(totalMinutes);
};
