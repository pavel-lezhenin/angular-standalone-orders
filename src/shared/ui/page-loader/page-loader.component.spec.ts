import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { PageLoaderComponent } from './page-loader.component';

describe('PageLoaderComponent', () => {
  let fixture: ComponentFixture<PageLoaderComponent>;
  let component: PageLoaderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageLoaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
