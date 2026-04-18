import 'dotenv';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DollarSign, IndianRupee } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUrl(path: string | URL) {
  const baseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000/"
  return new URL(path, baseUrl);
}

export function getCurrencyIcon(currency: string) {
  switch (currency) {
    case "USD":
      return DollarSign
    case "PKR":
      return IndianRupee
    default:
      return DollarSign
  }
}