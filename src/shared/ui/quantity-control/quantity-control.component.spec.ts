import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { QuantityControlComponent } from './quantity-control.component';

describe('QuantityControlComponent', () => {
  let component: QuantityControlComponent;
  let fixture: ComponentFixture<QuantityControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuantityControlComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
