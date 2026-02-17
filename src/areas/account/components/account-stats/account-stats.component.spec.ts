import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountStatsComponent } from './account-stats.component';

const setSignalInput = (component: AccountStatsComponent, inputName: string, value: unknown): void => {
  (component as unknown as Record<string, unknown>)[inputName] = signal(value);
};

describe('AccountStatsComponent', () => {
  let component: AccountStatsComponent;
  let fixture: ComponentFixture<AccountStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountStatsComponent);
    component = fixture.componentInstance;

    setSignalInput(component, 'totalOrders', 42);
    setSignalInput(component, 'totalSpent', 1250.5);
    setSignalInput(component, 'loyaltyPoints', 3500);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display total orders', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    const ordersValue = statValues[0]?.textContent;
    expect(ordersValue).toContain('42');
  });

  it('should display total spent formatted as currency', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    const spentValue = statValues[1]?.textContent;
    expect(spentValue).toContain('1,250.50');
  });

  it('should display loyalty points', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    const pointsValue = statValues[2]?.textContent;
    expect(pointsValue).toContain('3500');
  });

  it('should display all stat labels', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statLabels = compiled.querySelectorAll('.stat-label');
    
    expect(statLabels.length).toBe(3);
    expect(statLabels[0]?.textContent).toBe('Total Orders');
    expect(statLabels[1]?.textContent).toBe('Total Spent');
    expect(statLabels[2]?.textContent).toBe('Loyalty Points');
  });

  it('should have stats-grid with proper structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const statsGrid = compiled.querySelector('.stats-grid');
    const statItems = compiled.querySelectorAll('.stat-item');

    expect(statsGrid).toBeTruthy();
    expect(statItems.length).toBe(3);
  });
});
