import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dictionary } from '@app/interfaces/dictionary';
import { GameHistory } from '@app/interfaces/game-historic-info';
import { Message } from '@app/interfaces/message';
import { TopScore } from '@app/interfaces/top-scores';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { VPlayerName, VPlayerLevel } from 'src/constants/virtual-player-names';
import { loginInfos } from 'src/constants/login-constants';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/example/send`, message).pipe(catchError(this.handleError<void>('basicPost')));
    }
    /** ************** best scores methods *******************************/

    bestScoresClassicGet(): Observable<TopScore[]> {
        return this.http
            .get<TopScore[]>(`${this.baseUrl}/api/bestScore/Classic/all`)
            .pipe(catchError(this.handleError<TopScore[]>('bestScoresClassicGet')));
    }

    bestScoresLogGet(): Observable<TopScore[]> {
        return this.http
            .get<TopScore[]>(`${this.baseUrl}/api/bestScore/log2990/all`)
            .pipe(catchError(this.handleError<TopScore[]>('bestScoresLogGet')));
    }
    bestScoresPost(topScore: TopScore, mode: string): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/api/bestScore/${mode}/send`, topScore)
            .pipe(catchError(this.handleError<void>('bestScoresPost')));
    }
    bestScoreReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/bestScore/reset`).pipe(catchError(this.handleError<void>('bestScoreReset')));
    }
    /** ************** vPlayer methods *******************************/
    gameHistoryPost(gameInfo: GameHistory): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/gameHistory/send`, gameInfo).pipe(catchError(this.handleError<void>('gameHistoryPost')));
    }
    gameHistoryGet(): Observable<GameHistory[]> {
        return this.http
            .get<GameHistory[]>(`${this.baseUrl}/api/gameHistory/all`)
            .pipe(catchError(this.handleError<GameHistory[]>('gameHistoryGet')));
    }
    gameHistoryReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/gameHistory/reset`).pipe(catchError(this.handleError<void>('gameHistoryReset')));
    }

    virtualPlayerNamesGet(level: VPlayerLevel): Observable<VPlayerName[]> {
        return this.http
            .get<VPlayerName[]>(`${this.baseUrl}/api/virtualPlayer/` + level + '/all')
            .pipe(catchError(this.handleError<VPlayerName[]>('virtualPlayerNamesGet')));
    }

    virtualPlayerNamePut(oldName: string, newVirtualPlayer: VPlayerName, level: VPlayerLevel) {
        return this.http
            .put<VPlayerName>(`${this.baseUrl}/api/virtualPlayer/` + level + `/modifyName/${oldName}`, newVirtualPlayer)
            .pipe(catchError(this.handleError<VPlayerName>('virtualPlayerPut', newVirtualPlayer)));
    }

    virtualPlayerNameDelete(name: VPlayerName, level: VPlayerLevel) {
        return this.http
            .delete<void>(`${this.baseUrl}/api/virtualPlayer/` + level + `/delete/${name.name}`)
            .pipe(catchError(this.handleError<void>('virtualPlayerNameDelete')));
    }

    virtualPlayerNamePost(name: VPlayerName, level: VPlayerLevel): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/api/virtualPlayer/` + level + '/send', name)
            .pipe(catchError(this.handleError<void>('virtualPlayerNamePost')));
    }

    virtualPlayerNameReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/virtualPlayer/reset`).pipe(catchError(this.handleError<void>('virtualPlayerNameDelete')));
    }
    /** ************** Dictionary methods *******************************/
    postFile(fileToUpload: File): Observable<number> {
        const formData: FormData = new FormData();
        formData.append('fileKey', fileToUpload, fileToUpload.name);
        return this.http.post<number>(`${this.baseUrl}/api/dictionary/send`, formData).pipe(catchError(this.handleError<number>('postFile')));
    }

    getDictionaries(): Observable<Dictionary[]> {
        return this.http.get<Dictionary[]>(`${this.baseUrl}/api/dictionary/all`).pipe(catchError(this.handleError<Dictionary[]>('getDictionaries')));
    }

    getDictionary(title: string): Observable<Dictionary> {
        return this.http
            .get<Dictionary>(`${this.baseUrl}/api/dictionary/title/${title}`)
            .pipe(catchError(this.handleError<Dictionary>(`getDictionary title=${title}`)));
    }
    deleteDictionary(title: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/dictionary/title/${title}`).pipe(catchError(this.handleError<void>('deleteDictionary')));
    }
    putDictionary(beforeEdit: Dictionary, newInfo: Dictionary): Observable<Dictionary> {
        return this.http
            .put<Dictionary>(`${this.baseUrl}/api/dictionary/file/${beforeEdit.fileName}`, newInfo)
            .pipe(catchError(this.handleError<Dictionary>('putDictionary')));
    }
    dictionariesReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/dictionary/reset`).pipe(catchError(this.handleError<void>('dictionariesReset')));
    }

    /** ************** user Login methods *******************************/
    userlogin(infos : loginInfos) : Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/api/login/user`, infos)
        .pipe(catchError(this.handleError<boolean>('loginError')))
    }

    userLogout(username : string) : Observable<void>{
        return this.http.post<void>(`${this.baseUrl}/api/login/user/disconnect/${username}`, {})
        .pipe(catchError(this.handleError<void>('logoutError')))
    }

    accountCreation(infos : loginInfos) : Observable<boolean> {
        return this.http.put<boolean>(`${this.baseUrl}/api/login/user`,infos)
        .pipe(catchError(this.handleError<boolean>('accountCreationError')))
    }

    getUserConnexions(username : string) : Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/api/login/connexionhistory/${username}`)
        .pipe(catchError(this.handleError<any[]>('connexionHistoryError')))
    }

    changeUsername(old : string, newU : string) : Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/api/login/user/changeusername`, {old : old, newU : newU})
        .pipe(catchError(this.handleError<boolean>('logoutError')))
    }

    getUserCoins(username : string) : Observable<number[]>{
        return this.http.get<number[]>(`${this.baseUrl}/api/login/getcoins/${username}`)
        .pipe(catchError(this.handleError<number[]>('coinsGetError')))
    }

    addCoinsToUser(username : string, coinsToAdd : number) : Observable<boolean>{
        return this.http.put<boolean>(`${this.baseUrl}/api/login/addcoins`,{username : username, coins : coinsToAdd})
        .pipe(catchError(this.handleError<boolean>('coinsGetError')))
    }

    addScreenshotToUser(username : string, image : string, comment : string) : Observable<boolean>{
        return this.http.put<boolean>(`${this.baseUrl}/api/login/addimage`,{username : username, image : JSON.stringify(image), comment : comment})
        .pipe(catchError(this.handleError<boolean>('imagePutError')))
    }

    getUserScreenShot(username : string) :Observable<any>{
        return this.http.get<any>(`${this.baseUrl}/api/login/getimages/${username}`)
        .pipe(catchError(this.handleError<any>('imagesGetError')))
    }

    /** ************** chat channels methods *******************************/


    getUserChannels(username : string) : Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/api/channels/channel/${username}`)
        .pipe(catchError(this.handleError<void>('channelsGetError')))
    }

    getAllChannels() : Observable<any>{
        return this.http.get<any>(`${this.baseUrl}/api/channels/allchannels`)
        .pipe(catchError(this.handleError<void>('channelsGetError')))
    }

    /** ************** icon methods *******************************/

    getAllIcons(username : string) : Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/api/icons/get/${username}`)
        .pipe(catchError(this.handleError<string[]>('iconsGetError')))
    }

    pushIcon(icon : string,username : string) : Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/api/icons/add`,{image : JSON.stringify(icon), username : JSON.stringify(username)})
        .pipe(catchError(this.handleError<boolean>('logoutError')))
    }

    getAvatar(username : string) : Observable<string[]>{
        return this.http.get<string[]>(`${this.baseUrl}/api/icons/getusericon/${username}`)
        .pipe(catchError(this.handleError<string[]>('userIconsGetError')))
    }

    changeIcon(username : string,icon : string) : Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/api/icons/change`,{image : JSON.stringify(icon), username : JSON.stringify(username)})
        .pipe(catchError(this.handleError<boolean>('logoutError')))
    }


    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }

     /** ************** mode orthography methods *******************************/

    getAllWords() : Observable<any>{
        return this.http.get<any>(`${this.baseUrl}/api/modeOrthography/allWordsOrthography`)
        .pipe(catchError(this.handleError<void>('WordsGetError')))
    }

    getBestScore(username: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/api/modeOrthography/scoreOrthography/${username}`)
        .pipe(catchError(this.handleError<void>('channelsGetError')));
      }
      

}
