/**
 * Generate delete confirmation message for any entity
 *
 * @param entityName - Display name of the entity (e.g., "Electronics", "John Doe")
 * @param identifier - Optional additional identifier (e.g., email, ID)
 * @returns Formatted delete confirmation message
 */
export function generateDeleteMessage(entityName: string, identifier?: string): string {
  const identifierPart = identifier ? ` (${identifier})` : '';
  return `Delete "${entityName}"${identifierPart}?\n\nThis action cannot be undone.`;
}
