import { clsx, type ClassValue } from "clsx"
// Temporarily disable tailwind-merge to fix server-side issues
// import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  // Temporarily use only clsx to avoid server-side bundling issues
  return clsx(inputs)
  // return twMerge(clsx(inputs))
}
