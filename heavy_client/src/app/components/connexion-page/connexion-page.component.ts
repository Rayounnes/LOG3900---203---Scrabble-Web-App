import { Component, AfterViewInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { /* ActivatedRoute */ Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { loginInfos } from 'src/constants/login-constants';
import { ChatSocketClientService } from '@app/services/chat-socket-client.service';
import { AppComponent } from '@app/pages/app/app.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AvatarSelectionComponent } from '../avatar-selection/avatar-selection.component';
import { MatDialog } from '@angular/material/dialog';
/* import { DomSanitizer } from '@angular/platform-browser'; */

@Component({
    selector: 'app-connexion-page',
    templateUrl: './connexion-page.component.html',
    styleUrls: ['./connexion-page.component.scss'],
})
export class ConnexionPageComponent implements AfterViewInit {
    username: string = '';
    password: string = '';
    connected: boolean = false;
    accountCreation = false;
    checkingConnection: boolean = false;
    emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    usernamePattern = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]|\\:;"'<,>.?/]{5,}$/;
    passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<,>.?/])[a-zA-Z\d!@#$%^&*()_+={}\[\]|\\:;"'<,>.?/]{8,}$/;
    dialogRef: any;
    avatarChoosed: string = '';
    avatars: string[] = [];
    /* trustedUrl : any; */
    emailForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
    });

    usernameForm = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.pattern(this.usernamePattern)]),
    });

    passwordForm = new FormGroup({
        password: new FormControl('', [Validators.required, Validators.pattern(this.passwordPattern)]),
    });

    rememberMeForm = new FormGroup({
        remeberMe: new FormControl(false),
    });
    constructor(
        private communicationService: CommunicationService,
        private _snackBar: MatSnackBar,
        /* private route: ActivatedRoute, */ private router: Router,
        public socketService: ChatSocketClientService,
        private dialog: MatDialog,
        private appComponent: AppComponent,
    ) {
        this.connect();
    }

    async userConnection(): Promise<void> {
        let loginInfos: loginInfos;

        if (localStorage.getItem('username')  && localStorage.getItem('password') ) {
            loginInfos = {
                username: localStorage.getItem('username') as string,
                password: localStorage.getItem('password') as string,
            };
        } else {
            loginInfos = {
                username: this.usernameForm.value.username,
                password: this.passwordForm.value.password,
            };
        }

        this.communicationService.userlogin(loginInfos).subscribe((connectionValid): void => {
            if (connectionValid) {
                console.log(loginInfos)
                this.connected = true;
                
                this.socketService.send('user-connection', { username: loginInfos.username, socketId: this.socketService.socketId });
                this.router.navigate(['home']);
                this.appComponent.initiatePopout();
                // on save les logins seulement si le remember me est checked
                if (this.rememberMeForm.value.remeberMe) {
                    localStorage.setItem('username', loginInfos.username);
                    localStorage.setItem('password', loginInfos.password);
                }
            } else {
                this._snackBar.open(
                    "Erreur lors de la connexion. Mauvais nom d'utilisateur et/ou mot de passe ou compte deja connecté. Veuillez recommencer",
                    'Fermer',
                );
            }
        });
    }

    createAccount() {
        let loginInfos: loginInfos = {
            username: this.usernameForm.value['username'],
            password: this.passwordForm.value['password'],
            email: this.emailForm.value['email'],
            icon: this.avatarChoosed,
            socket: this.socketService.socketId,
        };

        this.communicationService.accountCreation(loginInfos).subscribe((accountCreationValid): void => {
            if (accountCreationValid) {
                this.connected = true;
                this.router.navigate(['home']);
                this.socketService.send('user-connection', { username: this.usernameForm.value['username'], socketId: this.socketService.socketId });
                this.appComponent.initiatePopout();
            } else {
                this._snackBar.open("Erreur lors de la création du compte. Nom d'utilisateur deja utilisé. Veuillez recommencer.", 'Fermer');
            }
        });
    }

    changeOption(accountCreation: boolean): void {
        this.accountCreation = accountCreation;
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }
    chooseAvatar() {
        this.dialogRef = this.dialog.open(AvatarSelectionComponent, {
            width: '1500px',
            height: '750px',
        });
        const subscription = this.dialogRef.componentInstance.avatar.subscribe((avatar: string) => {
            if (avatar) {
                this.avatarChoosed = avatar;
                subscription.unsubscribe();
            }
        });
    }

    getToolTip(field: string) {
        let tooltip = '';
        switch (field) {
            case 'email':
                tooltip = 'Veuillez respecter le format :\nabc@def.xyz';
                break;
            case 'username':
                tooltip = 'Veuillez respecter les conditions suivantes : \n  5 caracteres minimum (lettres, chiffres ou caracteres speciaux)';
                break;
            case 'password':
                tooltip =
                    'Veuillez respecter les conditions suivantes :  8 caracteres minimum \n , au moins une lettre minuscule \n ,au moins une lettre majuscule \n ,au moins un chiffre \n ,au moins un caractere spécial';
        }
        return tooltip;
    }
    ngAfterViewInit(): void {
        setTimeout(()=>{
            if (localStorage.getItem('username') && localStorage.getItem('password')) {
                this.userConnection();
            }
        },1000)
        
    }
}
