import { Timestamp } from "firebase/firestore";

export function formatJpDateFromDate(date: Date | null | undefined) {
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

export function formatJpDateFromString(dateString: string | null | undefined) {
  if (!dateString) {
    return undefined;
  }
  return formatJpDateFromDate(new Date(dateString));
}

export function formatJpDateFromTimestamp(timestamp: Timestamp | { seconds: number, nanoseconds: number } | string | null | undefined) {
  if (!timestamp) {
    return undefined;
  }
  let date: Date | undefined;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === "object" && typeof timestamp.seconds === "number") {
    // Convert plain object to Timestamp
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "string") {
    // Handle ISO string dates from API
    date = new Date(timestamp);
  } else {
    return undefined;
  }
  return formatJpDateFromDate(date);
}
