import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function generateSessionToken(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export const CATEGORY_LABELS: Record<string, string> = {
  scooter: 'Scooter',
  ac: 'Air Conditioner',
  washing_machine: 'Washing Machine',
  electronics: 'Electronics',
  appliance: 'Appliance',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<string, string> = {
  scooter: '🛵',
  ac: '❄️',
  washing_machine: '🫧',
  electronics: '⚡',
  appliance: '🏠',
  other: '📦',
};
