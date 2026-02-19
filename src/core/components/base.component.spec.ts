import { BaseComponent } from './base.component';

class TestComponent extends BaseComponent {
  // Concrete subclass for testing abstract base
}

describe('BaseComponent', () => {
  let component: TestComponent;

  beforeEach(() => {
    component = new TestComponent();
  });

  it('initial loading state is false', () => {
    expect(component.loading).toBe(false);
  });

  it('startLoading sets loading to true', () => {
    component.startLoading();

    expect(component.loading).toBe(true);
  });

  it('stopLoading sets loading back to false', () => {
    component.startLoading();
    component.stopLoading();

    expect(component.loading).toBe(false);
  });

  it('loading getter reflects underlying signal value', () => {
    expect(component.loading).toBe(false);

    component.startLoading();
    expect(component.loading).toBe(true);

    component.stopLoading();
    expect(component.loading).toBe(false);
  });

  it('multiple startLoading calls keep state true', () => {
    component.startLoading();
    component.startLoading();

    expect(component.loading).toBe(true);
  });

  it('stopLoading without prior startLoading keeps state false', () => {
    component.stopLoading();

    expect(component.loading).toBe(false);
  });
});
