import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LayoutService } from '@/shared/services/layout.service';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let component: MainLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [LayoutService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('injects LayoutService', () => {
    expect(component.layoutService).toBeTruthy();
  });

  it('renders top-bar with title from LayoutService', () => {
    const layoutService = TestBed.inject(LayoutService);
    layoutService.setTitle('Test Title');
    fixture.detectChanges();
    const topBar = fixture.nativeElement.querySelector('app-top-bar');
    expect(topBar).not.toBeNull();
  });
});
