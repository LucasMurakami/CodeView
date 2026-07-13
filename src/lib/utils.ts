/**
 * @file utils.ts
 * @description Standard Tailwind class utility helper.
 * Combines clsx dynamic class evaluation with tailwind-merge to safely compile Tailwind style declarations.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
