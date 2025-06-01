import { Timestamp } from "firebase/firestore";

export function formatJpDateFromDate(date: Date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleDateString("ja-JP", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export function formatJpDateFromString(dateString: string) {
  if (!dateString) {
    return undefined;
  }
  return formatJpDateFromDate(new Date(dateString));
}

export function formatJpDateFromTimestamp(timestamp: Timestamp) {
  if (!timestamp || !(timestamp instanceof Timestamp)) {
    return undefined;
  }
  return formatJpDateFromDate(timestamp.toDate());
}