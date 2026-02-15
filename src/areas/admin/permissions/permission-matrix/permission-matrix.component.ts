import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PermissionsByRole } from '../model';
import { UserRole } from '@core/types';
import { PermissionDTO } from '@core';

/**
 * Permission matrix table component
 *
 * Displays permissions grouped by role with checkboxes
 * Pure presentational component - emits toggle events to parent
 */
@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './permission-matrix.component.html',
  styleUrl: './permission-matrix.component.scss',
})
export class PermissionMatrixComponent {
  readonly permissionsByRole = input.required<PermissionsByRole[]>();
  readonly canEdit = input(false);

  readonly permissionToggle = output<{
    role: UserRole;
    section: string;
    action: string;
    granted: boolean;
  }>();
  
  readonly permissionDelete = output<{
    permissionId: string;
    role: UserRole;
  }>();

  /**
   * Get role badge class for styling
   */
  protected getRoleBadgeClass(role: UserRole): string {
    const classes: Record<UserRole, string> = {
      admin: 'badge-admin',
      manager: 'badge-manager',
      user: 'badge-user',
    };
    return classes[role] || '';
  }

  /**
   * Handle checkbox toggle
   */
  protected onToggle(
    role: UserRole,
    section: string,
    action: string,
    granted: boolean
  ): void {
    if (!this.canEdit()) return;
    
    this.permissionToggle.emit({ role, section, action, granted });
  }

  /**
   * Format section name for display
   */
  protected formatSectionName(section: string): string {
    return section
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format action name for display
   */
  protected formatActionName(action: string): string {
    return action.toUpperCase();
  }

  /**
   * Get granted permissions count for a role
   */
  protected getGrantedCount(permissions: PermissionDTO[]): number {
    return permissions.filter(p => p.granted).length;
  }

  /**
   * Check if permission is custom (can be deleted)
   */
  protected isCustomPermission(permissionId: string): boolean {
    return permissionId.startsWith('custom-');
  }

  /**
   * Handle delete permission
   */
  protected onDelete(permissionId: string, role: UserRole): void {
    if (!this.canEdit()) return;
    
    this.permissionDelete.emit({ permissionId, role });
  }
}
