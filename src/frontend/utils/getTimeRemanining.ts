export const getTimeRemaining = (endtime: Date | number) => {
  const total = new Date(endtime).getTime() - Date.now();
  return msToTime(total);
};

export const msToTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let timeStr = "";
  if (days) timeStr += `${days}d `;
  if (hours) timeStr += `${hours}h `;
  if (minutes) timeStr += `${minutes}m `;
  if (seconds) timeStr += `${seconds}s `;

  return timeStr.trim();
};
