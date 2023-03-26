import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CooperativeVoteComponent } from './cooperative-vote.component';

describe('CooperativeVoteComponent', () => {
  let component: CooperativeVoteComponent;
  let fixture: ComponentFixture<CooperativeVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CooperativeVoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CooperativeVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
