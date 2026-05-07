import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parses a Brazilian-formatted number string (e.g., "1.234,56") to a JS float. */
export function parseBR(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}
