import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterContainerComponent, FilterAction } from './filter-container.component';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mock-filter-content',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  template: `
    <mat-form-field>
      <mat-label>Search</mat-label>
      <input matInput placeholder="Search products..." />
    </mat-form-field>
    <mat-form-field>
      <mat-label>Category</mat-label>
      <mat-select>
        <mat-option value="electronics">Electronics</mat-option>
        <mat-option value="clothing">Clothing</mat-option>
        <mat-option value="books">Books</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field>
      <mat-label>Price Range</mat-label>
      <mat-select>
        <mat-option value="0-50">$0 - $50</mat-option>
        <mat-option value="50-100">$50 - $100</mat-option>
        <mat-option value="100+">$100+</mat-option>
      </mat-select>
    </mat-form-field>
  `,
})
class MockFilterContentComponent {}

const defaultActions: FilterAction[] = [
  {
    id: 'reset',
    icon: 'refresh',
    tooltip: 'Reset filters',
    ariaLabel: 'Reset all filters',
  },
  {
    id: 'export',
    icon: 'download',
    tooltip: 'Export data',
    ariaLabel: 'Export filtered data',
  },
];

const meta: Meta<FilterContainerComponent> = {
  title: 'Shared/UI/FilterContainer',
  component: FilterContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MockFilterContentComponent],
    }),
  ],
  args: {
    isLoading: false,
    actions: defaultActions,
  },
  argTypes: {
    action: {
      action: 'action',
    },
  },
};

export default meta;
type Story = StoryObj<FilterContainerComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <app-filter-container 
        [isLoading]="isLoading" 
        [actions]="actions"
        (action)="action($event)">
        <app-mock-filter-content />
      </app-filter-container>
    `,
  }),
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-filter-container 
        [isLoading]="isLoading" 
        [actions]="actions"
        (action)="action($event)">
        <app-mock-filter-content />
      </app-filter-container>
    `,
  }),
};

export const NoActions: Story = {
  args: {
    actions: [],
  },
  render: (args) => ({
    props: args,
    template: `
      <app-filter-container 
        [isLoading]="isLoading" 
        [actions]="actions"
        (action)="action($event)">
        <app-mock-filter-content />
      </app-filter-container>
    `,
  }),
};

export const WithDisabledAction: Story = {
  args: {
    actions: [
      ...defaultActions,
      {
        id: 'delete',
        icon: 'delete',
        tooltip: 'Delete (disabled)',
        ariaLabel: 'Delete filtered items',
        disabled: true,
      },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <app-filter-container 
        [isLoading]="isLoading" 
        [actions]="actions"
        (action)="action($event)">
        <app-mock-filter-content />
      </app-filter-container>
    `,
  }),
};
