/**
 * Client-side security utilities against bot attacks, spam signups, and brute-force attempts.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

const attemptTracker: Record<string, AttemptRecord> = {};

/**
 * Checks if the current client is locked out due to excessive failed attempts
 */
export function checkRateLimit(actionKey: string = 'auth'): { isLocked: boolean; remainingSeconds: number } {
  const record = attemptTracker[actionKey];
  if (!record || !record.lockedUntil) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // Lockout expired, reset counter
  attemptTracker[actionKey] = { count: 0, lockedUntil: null };
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Records a failed login or register attempt and triggers lockout if max threshold exceeded
 */
export function recordFailedAttempt(actionKey: string = 'auth'): { isLocked: boolean; remainingSeconds: number } {
  const current = attemptTracker[actionKey] || { count: 0, lockedUntil: null };
  const newCount = current.count + 1;

  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    attemptTracker[actionKey] = { count: newCount, lockedUntil };
    return { isLocked: true, remainingSeconds: 60 };
  }

  attemptTracker[actionKey] = { count: newCount, lockedUntil: null };
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Resets failed attempts counter upon successful authentication
 */
export function resetFailedAttempts(actionKey: string = 'auth'): void {
  delete attemptTracker[actionKey];
}

/**
 * Generates a random math anti-bot captcha challenge (e.g., "7 + 5")
 */
export function generateAntiBotChallenge(): { num1: number; num2: number; answer: number; text: string } {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return {
    num1,
    num2,
    answer: num1 + num2,
    text: `What is ${num1} + ${num2}?`
  };
}

/**
 * Detects if a hidden honeypot input field was filled out by an automated spam bot
 */
export function isBotHoneypotTriggered(honeypotValue: string): boolean {
  return Boolean(honeypotValue && honeypotValue.trim().length > 0);
}
