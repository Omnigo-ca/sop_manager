import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function formatDateToFrench(date: Date): Promise<string> {
  return new Intl.DateTimeFormat('fr-FR').format(date);
}
