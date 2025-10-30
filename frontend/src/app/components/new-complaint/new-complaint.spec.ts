import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewComplaint } from './new-complaint';

describe('NewComplaint', () => {
  let component: NewComplaint;
  let fixture: ComponentFixture<NewComplaint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewComplaint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewComplaint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
