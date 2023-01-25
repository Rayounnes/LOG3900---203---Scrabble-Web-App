import { Injectable, Inject } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConfirmationService {
    constructor(@Inject(String) public title: string, @Inject(String) public message: string) {}
}
