export function formatRuntime(runtimeMinutes: number): string {
  const hours = Math.floor(runtimeMinutes / 60);
  const minutes = runtimeMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
