import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileInfoComponent } from './profile-info.component';

describe('ProfileInfoComponent', () => {
  let component: ProfileInfoComponent;
  let fixture: ComponentFixture<ProfileInfoComponent>;
  let profileForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInfoComponent],
    }).compileComponents();

    const fb = new FormBuilder();
    profileForm = fb.group({
      firstName: ['John', [Validators.required]],
      lastName: ['Doe', [Validators.required]],
      email: [{ value: 'john@example.com', disabled: true }],
      phone: ['+1234567890'],
    });

    fixture = TestBed.createComponent(ProfileInfoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('profileForm', profileForm);
    fixture.componentRef.setInput('isEditMode', false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display form fields', () => {
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('should show lock icons when not in edit mode', () => {
    fixture.componentRef.setInput('isEditMode', false);
    fixture.detectChanges();

    const lockIcons = fixture.nativeElement.querySelectorAll('mat-icon');
    const lockIconsCount = Array.from(lockIcons).filter(
      (icon: any) => icon.textContent?.includes('lock')
    ).length;
    expect(lockIconsCount).toBeGreaterThan(0);
  });

  it('should make fields editable in edit mode', () => {
    fixture.componentRef.setInput('isEditMode', true);
    fixture.detectChanges();

    const firstNameInput = fixture.nativeElement.querySelector('input[formControlName="firstName"]');
    expect(firstNameInput?.readOnly).toBe(false);
  });
});
