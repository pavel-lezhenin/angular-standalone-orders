import type { Meta, StoryObj } from '@storybook/angular';
import { PermissionMatrixComponent } from './permission-matrix.component';
import type { PermissionsByRole } from '../model';
import type { PermissionDTO } from '@core';

const meta: Meta<PermissionMatrixComponent> = {
  title: 'Admin/PermissionMatrix',
  component: PermissionMatrixComponent,
  tags: ['autodocs'],
  argTypes: {
    permissionToggle: { action: 'permissionToggle' },
    permissionDelete: { action: 'permissionDelete' },
  },
};

export default meta;
type Story = StoryObj<PermissionMatrixComponent>;

const adminPermissions: PermissionDTO[] = [
  { id: 'perm-admin-1', role: 'admin', section: 'orders_all', action: 'crud', granted: true },
  { id: 'perm-admin-2', role: 'admin', section: 'products', action: 'crud', granted: true },
  { id: 'perm-admin-3', role: 'admin', section: 'categories', action: 'crud', granted: true },
  { id: 'perm-admin-4', role: 'admin', section: 'permissions', action: 'crud', granted: true },
];

const managerPermissions: PermissionDTO[] = [
  { id: 'perm-mgr-1', role: 'manager', section: 'orders_all', action: 'view', granted: true },
  { id: 'perm-mgr-2', role: 'manager', section: 'orders_all', action: 'edit', granted: true },
  { id: 'perm-mgr-3', role: 'manager', section: 'cancelled_orders', action: 'view', granted: true },
  { id: 'perm-mgr-4', role: 'manager', section: 'products', action: 'view', granted: true },
  { id: 'perm-mgr-5', role: 'manager', section: 'products', action: 'edit', granted: true },
  { id: 'perm-mgr-6', role: 'manager', section: 'categories', action: 'view', granted: true },
  { id: 'perm-mgr-7', role: 'manager', section: 'dashboard', action: 'view', granted: true },
];

const userPermissions: PermissionDTO[] = [
  { id: 'perm-user-1', role: 'user', section: 'orders_own', action: 'view', granted: true },
  { id: 'perm-user-2', role: 'user', section: 'orders_own', action: 'create', granted: true },
  { id: 'perm-user-3', role: 'user', section: 'cart', action: 'crud', granted: true },
  { id: 'perm-user-4', role: 'user', section: 'profile', action: 'view', granted: true },
  { id: 'perm-user-5', role: 'user', section: 'profile', action: 'edit', granted: true },
];

const mockPermissionsByRole: PermissionsByRole[] = [
  { role: 'admin', permissions: adminPermissions },
  { role: 'manager', permissions: managerPermissions },
  { role: 'user', permissions: userPermissions },
];

export const Default: Story = {
  args: {
    permissionsByRole: mockPermissionsByRole,
    canEdit: true,
  },
};

export const ReadOnly: Story = {
  args: {
    permissionsByRole: mockPermissionsByRole,
    canEdit: false,
  },
};

export const OnlyUserRole: Story = {
  args: {
    permissionsByRole: [{ role: 'user', permissions: userPermissions }],
    canEdit: true,
  },
};

export const OnlyManagerRole: Story = {
  args: {
    permissionsByRole: [{ role: 'manager', permissions: managerPermissions }],
    canEdit: true,
  },
};

export const OnlyAdminRole: Story = {
  args: {
    permissionsByRole: [{ role: 'admin', permissions: adminPermissions }],
    canEdit: true,
  },
};

export const EmptyPermissions: Story = {
  args: {
    permissionsByRole: [
      { role: 'admin', permissions: [] },
      { role: 'manager', permissions: [] },
      { role: 'user', permissions: [] },
    ],
    canEdit: true,
  },
};

export const MixedPermissions: Story = {
  args: {
    permissionsByRole: [
      { role: 'admin', permissions: adminPermissions },
      {
        role: 'manager',
        permissions: [
          {
            id: 'perm-mgr-1',
            role: 'manager',
            section: 'orders_all',
            action: 'view',
            granted: true,
          },
          {
            id: 'perm-mgr-2',
            role: 'manager',
            section: 'orders_all',
            action: 'edit',
            granted: false,
          },
          { id: 'perm-mgr-3', role: 'manager', section: 'products', action: 'view', granted: true },
          {
            id: 'perm-mgr-4',
            role: 'manager',
            section: 'products',
            action: 'edit',
            granted: false,
          },
        ],
      },
      {
        role: 'user',
        permissions: [
          { id: 'perm-user-1', role: 'user', section: 'cart', action: 'crud', granted: true },
          { id: 'perm-user-2', role: 'user', section: 'profile', action: 'view', granted: true },
          { id: 'perm-user-3', role: 'user', section: 'profile', action: 'edit', granted: false },
        ],
      },
    ],
    canEdit: true,
  },
};
