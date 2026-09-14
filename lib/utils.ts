type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

export function fakeRequest(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
