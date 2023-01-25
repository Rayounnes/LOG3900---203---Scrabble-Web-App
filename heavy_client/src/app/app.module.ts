/* eslint-disable import/no-duplicates */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChevaletComponent } from './components/chevalet/chevalet.component';
import { ConfirmationMessageComponent } from './components/confirmation-message/confirmation-message.component';
import { InformationPanelComponent } from './components/information-panel/information-panel.component';
import { SurrenderGameComponent } from './components/surrender-game/surrender-game.component';
import { AdminPanelComponent } from './pages/admin-page/admin-panel.component';
import { BestScoresComponent } from './pages/best-scores/best-scores.component';
import { ClassiquePageComponent } from './pages/classique-page/classique-page.component';
import { JoindrePartieComponent } from './pages/joindre-partie/joindre-partie.component';
import { PartieMultijoueurPageComponent } from './pages/partie-multijoueur-page/partie-multijoueur-page.component';
import { SoloGamePageComponent } from './pages/solo-game-page/solo-game-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { DictionaryComponent } from './components/dictionary/dictionary.component';
import { MatTabsModule } from '@angular/material/tabs';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        ChevaletComponent,
        PlayAreaComponent,
        SidebarComponent,
        SurrenderGameComponent,
        ConfirmationMessageComponent,
        ChatBoxComponent,
        ClassiquePageComponent,
        AdminPanelComponent,
        PartieMultijoueurPageComponent,
        JoindrePartieComponent,
        WaitingRoomPageComponent,
        InformationPanelComponent,
        BestScoresComponent,
        SoloGamePageComponent,
        DictionaryComponent,
    ],
    imports: [
        MatProgressSpinnerModule,
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        MatTableModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatSnackBarModule,
        MatFormFieldModule,
        RouterModule,
        MatCardModule,
        MatDialogModule,
        MatTabsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
