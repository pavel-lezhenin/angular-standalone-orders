import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { AccountStatsComponent } from './account-stats.component';

describe('AccountStatsComponent', () => {
  let component: AccountStatsComponent;
  let fixture: ComponentFixture<AccountStatsComponent>;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [AccountStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountStatsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('totalOrders', 42);
    fixture.componentRef.setInput('totalSpent', 1250.5);
    fixture.componentRef.setInput('loyaltyPoints', 3500);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
