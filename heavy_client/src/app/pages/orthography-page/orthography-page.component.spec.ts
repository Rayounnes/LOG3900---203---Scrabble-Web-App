import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrthographyPageComponent } from './orthography-page.component';

describe('OrthographyPageComponent', () => {
  let component: OrthographyPageComponent;
  let fixture: ComponentFixture<OrthographyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrthographyPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrthographyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
