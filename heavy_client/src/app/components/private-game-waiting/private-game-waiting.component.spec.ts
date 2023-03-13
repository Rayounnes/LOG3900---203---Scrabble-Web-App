import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateGameWaitingComponent } from './private-game-waiting.component';

describe('PrivateGameWaitingComponent', () => {
  let component: PrivateGameWaitingComponent;
  let fixture: ComponentFixture<PrivateGameWaitingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivateGameWaitingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateGameWaitingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
