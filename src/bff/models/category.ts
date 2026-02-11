/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  settings?: Record<string, unknown>;
}
