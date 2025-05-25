export function formatJpDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}