import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TwoColumnLayoutComponent } from './two-column-layout.component';

describe('TwoColumnLayoutComponent', () => {
  let fixture: ComponentFixture<TwoColumnLayoutComponent>;
  let component: TwoColumnLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoColumnLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TwoColumnLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses default sidebarWidth', () => {
    expect(component.sidebarWidth()).toBe('var(--cart-sidebar-width)');
  });

});
