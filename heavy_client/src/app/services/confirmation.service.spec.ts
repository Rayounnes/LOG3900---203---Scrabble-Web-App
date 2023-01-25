import { TestBed } from '@angular/core/testing';

import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
    let service: ConfirmationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new ConfirmationService('titre', 'message');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
