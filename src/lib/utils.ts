import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}
