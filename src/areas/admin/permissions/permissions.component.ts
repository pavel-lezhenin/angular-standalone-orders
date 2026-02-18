import type { OnInit} from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { BaseComponent } from '@core';
import { PageLoaderComponent } from '@shared/ui/page-loader';
import { NotificationService } from '@shared/services/notification.service';
import { ConfirmDialogService } from '@shared/ui/dialog';
import { createFormDialogConfig } from '@shared/ui/dialog/dialog.config';
import { PermissionManagementService } from './services/permission-management.service';
import { PermissionMatrixComponent } from './permission-matrix/permission-matrix.component';
import type {
  PermissionFormDialogData} from './permission-form-dialog/permission-form-dialog.component';
import {
  PermissionFormDialogComponent
} from './permission-form-dialog/permission-form-dialog.component';
import type { PermissionsByRole } from './model';
import type { UserRole } from '@core/types';

/**
 * Permissions management page (Admin only)
 *
 * Orchestrator component:
 * - Manages state and coordinates permission matrix display
 * - Delegates UI rendering to PermissionMatrixComponent
 * - Handles permission toggle operations via PermissionManagementService
 */
@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    PermissionMatrixComponent,
    PageLoaderComponent,
  ],
  providers: [PermissionManagementService],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsComponent extends BaseComponent implements OnInit {
  private readonly permissionManagementService = inject(PermissionManagementService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  /**
   * Local state
   */
  protected readonly canCreate = signal(false);
  protected readonly permissionsByRole = signal<PermissionsByRole[]>([]);
  protected readonly canEdit = signal(false);

  async ngOnInit(): Promise<void> {
    this.initPermissions();
    await this.loadPermissions();
  }

  /**
   * Initialize permissions (synchronous)
   */
  private initPermissions(): void {
    const permissions = this.permissionManagementService.getPermissions();
    this.canCreate.set(permissions.canEdit); // If can edit, can also create
    this.canEdit.set(permissions.canEdit);
  }

  /**
   * Load all permissions grouped by role
   */
  private async loadPermissions(): Promise<void> {
    this.startLoading();
    try {
      const permissionsByRole = await this.permissionManagementService.loadPermissions();
      this.permissionsByRole.set(permissionsByRole);
    } catch (err: unknown) {
      console.error('Failed to load permissions:', err);
      this.notificationService.error('Failed to load permissions');
    } finally {
      this.stopLoading();
    }
  }

  /**
   * Handle permission toggle from child component
   */
  protected async onPermissionToggle(event: {
    role: UserRole;
    section: string;
    action: string;
    granted: boolean;
  }): Promise<void> {
    this.startLoading();
    try {
      await this.permissionManagementService.togglePermission(
        event.role,
        event.section,
        event.action,
        event.granted
      );
      
      // Reload permissions to reflect changes
      await this.loadPermissions();
      
      this.notificationService.success(
        `Permission ${event.granted ? 'granted' : 'revoked'} successfully`
      );
    } catch (err: unknown) {
      console.error('Failed to toggle permission:', err);
      this.notificationService.error('Failed to update permission');
    } finally {
      this.stopLoading();
    }
  }

  /**
   * Refresh permissions manually
   */
  protected async refresh(): Promise<void> {
    await this.loadPermissions();
    this.notificationService.success('Permissions refreshed');
  }

  /**
   * Open create permission dialog
   */
  protected openCreateDialog(): void {
    this.dialog.open<PermissionFormDialogComponent, PermissionFormDialogData>(
      PermissionFormDialogComponent,
      {
        ...createFormDialogConfig('Create Custom Permission', 'Create'),
        data: {
          ...createFormDialogConfig('Create Custom Permission', 'Create').data,
          onSave: async (formValue) => {
            this.startLoading();
            try {
              await this.permissionManagementService.createPermission(formValue);
              await this.loadPermissions();
              this.notificationService.success('Permission created successfully');
            } catch (err: unknown) {
              console.error('Failed to create permission:', err);
              this.notificationService.error('Failed to create permission');
              throw err;
            } finally {
              this.stopLoading();
            }
          },
        },
      }
    );
  }

  /**
   * Handle permission deletion
   */
  protected onPermissionDelete(event: {
    permissionId: string;
    role: UserRole;
  }): void {
    this.confirmDialogService.openDeleteConfirm(
      `Are you sure you want to delete this custom permission?`,
      async () => {
        await this.permissionManagementService.deletePermission(event.permissionId);
        await this.loadPermissions();
        this.notificationService.success('Permission deleted successfully');
      },
      () => {
        this.notificationService.error('Failed to delete permission');
      }
    );
  }
}
