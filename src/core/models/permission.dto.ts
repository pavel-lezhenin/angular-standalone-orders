/**
 * Permission DTO for application layer
 */
export interface PermissionDTO {
  id: string;
  role: string;
  section: string;
  action: string;
  granted: boolean;
}
