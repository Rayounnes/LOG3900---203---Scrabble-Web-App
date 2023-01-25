import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    // const confirmationSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    const mockDialogAfterClose = {
        afterClosed: jasmine.createSpy('afterClosed'),
    };
    const mockDialog = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        open: jasmine.createSpy('open'),
    };
    const mockDialogSubscribe = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        subscribe: jasmine.createSpy('subscribe'),
    };

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost'], ['gameMode']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of());
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: mockDialog },
                { provide: CommunicationService, useValue: communicationServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.h = 'g';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to home page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navClassicPage();
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to home page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navClassicPage();
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to log page', () => {
        const spy = spyOn(component.router, 'navigate');
        component.navLogPage();
        expect(spy).toHaveBeenCalled();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('Scrabble');
    });

    it('popUp should call after close', async () => {
        mockDialog.open.and.returnValue(mockDialogAfterClose);
        mockDialogAfterClose.afterClosed.and.returnValue(of());
        mockDialogSubscribe.subscribe.and.returnValue(of());
        component.popUp();
        expect(component.h).toEqual('g');
    });
});
