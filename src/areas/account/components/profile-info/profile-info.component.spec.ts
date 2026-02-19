import { TestBed } from '@angular/core/testing';
import { ProfileInfoComponent } from './profile-info.component';

describe('ProfileInfoComponent', () => {
  let component: ProfileInfoComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ProfileInfoComponent());
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
