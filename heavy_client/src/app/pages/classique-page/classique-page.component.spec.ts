import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassiquePageComponent } from './classique-page.component';

describe('ClassiquePageComponent', () => {
    let component: ClassiquePageComponent;
    let fixture: ComponentFixture<ClassiquePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [ClassiquePageComponent],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassiquePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to home page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navHome();
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to solo game page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navSoloGame();
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to multiplayer game page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navMultiGame();
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to join game page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navJoinGame();
        expect(spy).toHaveBeenCalled();
    });
});
