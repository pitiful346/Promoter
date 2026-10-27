export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isRevealed: boolean;
  totalMsRemaining: number;
}

export function calculateTimeRemaining(targetIsoString: string): CountdownTime {
  const targetTime = new Date(targetIsoString).getTime();
  const now = Date.now();
  const totalMsRemaining = Math.max(0, targetTime - now);

  if (totalMsRemaining <= 0 || isNaN(targetTime)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isRevealed: true,
      totalMsRemaining: 0,
    };
  }

  const seconds = Math.floor((totalMsRemaining / 1000) % 60);
  const minutes = Math.floor((totalMsRemaining / 1000 / 60) % 60);
  const hours = Math.floor((totalMsRemaining / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMsRemaining / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isRevealed: false,
    totalMsRemaining,
  };
}
