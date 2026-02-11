/**
 * Generate a random delay between min and max milliseconds
 *
 * @param min - Minimum delay in ms (default: 300)
 * @param max - Maximum delay in ms (default: 800)
 * @returns Promise that resolves after random delay
 */
export function randomDelay(min: number = 300, max: number = 800): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
