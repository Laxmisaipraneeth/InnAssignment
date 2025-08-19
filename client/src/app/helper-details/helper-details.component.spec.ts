import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperDetailsComponent } from './helper-details.component';

describe('HelperDetailsComponent', () => {
  let component: HelperDetailsComponent;
  let fixture: ComponentFixture<HelperDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelperDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelperDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
