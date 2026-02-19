/**
 * Navigation item for configurable top bar menu
 */
export interface NavItem {
  label: string;
  route?: string;
  action?: () => void;
  icon?: string;
}
