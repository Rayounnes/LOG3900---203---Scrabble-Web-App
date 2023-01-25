import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GamePageComponent } from './game-page.component';
import { CommunicationService } from '@app/services/communication.service';

import SpyObj = jasmine.SpyObj;
import { ActivatedRoute } from '@angular/router';

describe('GamePageComponent', () => {
    let communicationServiceSpy: SpyObj<CommunicationService>;

    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost'], ['gameMode']);

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'classic' } } } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('rightMouseOutsideCanvas should call deselectAllLetters', () => {
        // eslint-disable-next-line dot-notation
        const event = jasmine.createSpyObj('MouseEvent', ['target', 'preventDefault', 'stopPropagation']);
        event.target = jasmine.createSpyObj('EventTarget', ['id']);
        event.target.id = 'notcanvas';
        const spy = spyOn(component.chevaletService, 'deselectAllLetters');
        component.rightMouseOutsideCanvas(event);
        expect(spy).toHaveBeenCalled();
    });
    it('rightMouseOutsideCanvas should call deselectAllLetters', () => {
        // eslint-disable-next-line dot-notation
        const event = jasmine.createSpyObj('MouseEvent', ['stopPropagation', 'preventDefault', 'target']);
        event.target = jasmine.createSpyObj('EventTarget', ['id']);
        event.target.id = 'canvas';
        const spy = spyOn(component.chevaletService, 'deselectAllLetters');
        component.rightMouseOutsideCanvas(event);
        expect(spy).not.toHaveBeenCalled();
    });
});
