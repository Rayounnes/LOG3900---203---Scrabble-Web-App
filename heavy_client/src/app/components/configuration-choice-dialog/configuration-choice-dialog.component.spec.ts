import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationChoiceDialogComponent } from './configuration-choice-dialog.component';

describe('ConfigurationChoiceDialogComponent', () => {
  let component: ConfigurationChoiceDialogComponent;
  let fixture: ComponentFixture<ConfigurationChoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationChoiceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationChoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
