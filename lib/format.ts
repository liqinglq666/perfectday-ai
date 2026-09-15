export function formatMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return hours ? `${hours}小时${minutes ? `${minutes}分` : ""}` : `${minutes}分钟`;
}
