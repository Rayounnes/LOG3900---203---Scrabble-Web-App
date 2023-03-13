import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePasswordFormComponent } from './game-password-form.component';

describe('GamePasswordFormComponent', () => {
  let component: GamePasswordFormComponent;
  let fixture: ComponentFixture<GamePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamePasswordFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
