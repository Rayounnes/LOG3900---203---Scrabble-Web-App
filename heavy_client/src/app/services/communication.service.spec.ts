/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/interfaces/dictionary';
import { GameHistory } from '@app/interfaces/game-historic-info';
import { Message } from '@app/interfaces/message';
import { CommunicationService } from '@app/services/communication.service';
import { VIRTUAL_PLAYERS_BEGGINERS } from 'src/constants/virtual-player-names';

export interface VPlayerName {
    name: string;
}
export enum VPlayerLevel {
    Expert = 'expert',
    Beginner = 'beginner',
}

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };

        // check the content of the mocked call
        service.basicGet().subscribe((response: Message) => {
            expect(response.title).toEqual(expectedMessage.title);
            expect(response.body).toEqual(expectedMessage.body);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should return expected game history', () => {
        const expectedGameHistory: GameHistory = {
            duration: '20min 25sec',
            playerName: 'Nab',
            finalScore: 200,
            opponentPlayerName: 'Marc',
            oponnentFinalScore: 150,
            mode: 'Classique',
            date: "'11/04/2022, 00:12:11'",
            abandoned: '',
        };
        service.gameHistoryGet().subscribe((response) => {
            expect(response[0].playerName).toEqual(expectedGameHistory.playerName);
            expect(response[0].opponentPlayerName).toEqual(expectedGameHistory.opponentPlayerName);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/api/gameHistory/all`);
        expect(req.request.method).toBe('GET');
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.basicPost(sentMessage).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/example/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentMessage);
    });

    it('Methode of postFile should be POST', () => {
        const dictionary = {} as File;
        spyOn(FormData.prototype, 'append').and.stub();
        service.postFile(dictionary).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/dictionary/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(dictionary);
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe((response: Message) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should return expected dictionary', () => {
        const expectedDictionary: Dictionary = {
            title: 'string',
            description: 'string',
            words: ['string', 'string', 'string'],
            fileName: 'testDictionary',
        };

        // check the content of the mocked call
        service.getDictionary(expectedDictionary.title).subscribe((response: Dictionary) => {
            expect(response).toEqual(expectedDictionary);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/api/dictionary/title/string`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedDictionary);
    });
    it('should not return dictionary delete when sending a Delete request', () => {
        const dictionary: Dictionary = {
            title: 'string',
            description: 'string',
            words: ['string', 'string', 'string'],
            fileName: 'testDictionary',
        };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.deleteDictionary(dictionary.title).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/dictionary/title/string`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should not return dictionary when sending a PUT request (HttpClient called once)', () => {
        const dictionary: Dictionary = {
            title: 'string',
            description: 'string',
            words: ['string', 'string', 'string'],
            fileName: 'testDictionary',
        };
        const dictionaryBeforeEdit: Dictionary = {
            title: 'number',
            description: 'number',
            words: ['number', 'number', 'number'],
            fileName: 'testNumber',
        };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.putDictionary(dictionaryBeforeEdit, dictionary).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/dictionary/file/${dictionaryBeforeEdit.fileName}`);
        expect(req.request.method).toBe('PUT');
        // actually send the request
        req.flush(dictionary);
    });
    it('should not return dictionaries delete when sending a Delete request for reset', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.dictionariesReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/dictionary/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });
    it('should not return game history delete when sending a Delete request for reset', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.gameHistoryReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/gameHistory/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });
    it('should not return best scores delete when sending a Delete request for reset', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.bestScoreReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/bestScore/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });
    it('should not return virtual player delete when sending a Delete request', () => {
        const virtualPlayer: VPlayerName = { name: 'virtualPlayerName' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNameDelete(virtualPlayer, VPlayerLevel.Beginner).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/virtualPlayer/beginner/delete/virtualPlayerName`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });

    it('should not return virtual players delete when sending a Delete request for reset', () => {
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNameReset().subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/virtualPlayer/reset`);
        expect(req.request.method).toBe('DELETE');
        // actually send the request
    });
    it('should not return Virtual player when sending a PUT request', () => {
        const virtualPlayer: VPlayerName = { name: 'virtualPlayerName' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNamePut('testVirtualPlayer', virtualPlayer, VPlayerLevel.Beginner).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/virtualPlayer/beginner/modifyName/testVirtualPlayer`);
        expect(req.request.method).toBe('PUT');
        // actually send the request
        req.flush(virtualPlayer);
    });
    it('should return expected virtualPlayer (HttpClient called once)', () => {
        const expectedVirtualPlayerNames: VPlayerName[] = VIRTUAL_PLAYERS_BEGGINERS;

        // check the content of the mocked call
        service.virtualPlayerNamesGet(VPlayerLevel.Beginner).subscribe((response: VPlayerName[]) => {
            expect(response).toEqual(expectedVirtualPlayerNames);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}/api/virtualPlayer/beginner/all`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedVirtualPlayerNames);
    });
    it('should not return virtual when sending a POST request)', () => {
        const virtualPlayer: VPlayerName = { name: 'testVirtualPlayer' };
        // subscribe to the mocked call
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- We explicitly need an empty function
        service.virtualPlayerNamePost(virtualPlayer, VPlayerLevel.Beginner).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}/api/virtualPlayer/beginner/send`, virtualPlayer.name);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(virtualPlayer);
    });
});
