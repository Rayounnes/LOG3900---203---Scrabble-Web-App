import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteLetterDialogComponent } from './white-letter-dialog.component';

describe('WhiteLetterDialogComponent', () => {
  let component: WhiteLetterDialogComponent;
  let fixture: ComponentFixture<WhiteLetterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhiteLetterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteLetterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
