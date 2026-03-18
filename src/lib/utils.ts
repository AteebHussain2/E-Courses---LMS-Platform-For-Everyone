import 'dotenv';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUrl(path: string) {
  const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000/"
  return new URL(path, baseUrl);
}