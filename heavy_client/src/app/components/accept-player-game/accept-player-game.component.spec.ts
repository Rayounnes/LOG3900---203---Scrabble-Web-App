import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptPlayerGameComponent } from './accept-player-game.component';

describe('AcceptPlayerGameComponent', () => {
  let component: AcceptPlayerGameComponent;
  let fixture: ComponentFixture<AcceptPlayerGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptPlayerGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptPlayerGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
