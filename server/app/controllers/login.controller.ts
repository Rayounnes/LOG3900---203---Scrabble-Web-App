import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED, loginInfos } from '@app/constants/constants';
import { LoginService } from '@app/services/login.service';

@Service()
export class loginController {
    router: Router;

    constructor(private loginService: LoginService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/user', async (req: Request, res: Response, next): Promise<void> => {
            const userLoginInfos: loginInfos = req.body;
            this.loginService.checkLoginValidity(userLoginInfos).then((isValid): void => {
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            });
        });

        this.router.post('/user/disconnect/:username', async (req: Request, res: Response, next): Promise<void> => {
            const username: string = req.params.username;
            this.loginService.changeConnectionState(username, false).then((): void => {
                res.sendStatus(HTTP_STATUS_NO_CONTENT);
            });
        });

        this.router.put('/user', async (req: Request, res: Response, next): Promise<void> => {
            const newAccountInfos: loginInfos = req.body;
            this.loginService.createNewAccount(newAccountInfos).then((isValid): void => {
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            });
        });

        this.router.get('/connexionhistory/:username', async (req: Request, res: Response, next): Promise<void> => {
            const username: string = req.params.username;
            this.loginService.getConnexionHistory(username).then((history): void => {
                res.status(history.length > 0 ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(history);
            });
        });

        this.router.get('/getcoins/:username', async (req: Request, res: Response, next): Promise<void> => {
            const username: string = req.params.username;
            this.loginService.getUserCoins(username).then((coins : number[]): void => {
                res.status(HTTP_STATUS_OK).send(coins);
            });
        });

        this.router.put('/addcoins', async (req: Request, res: Response, next): Promise<void> => {
            const username: string = req.body.username;
            const coinsToAdd : number = req.body.coins;
            this.loginService.addCoinsToUser(username,coinsToAdd).then((isValid : boolean): void => {
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            });
        });

        this.router.put('/addimage', async (req: Request, res: Response, next): Promise<void> => {
            const username: string = req.body.username;
            const image : string = JSON.parse(req.body.image);
            const comment : string = req.body.comment;
            this.loginService.addScreenshotToUser(username,image,comment).then((isValid): void => {
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            });
        });

        this.router.get('/getimages/:username', async (req: Request, res: Response, next): Promise<void> => {
            const username: string = req.params.username;
            this.loginService.getUserScreenShots(username).then((screenshots : any): void => {
                res.status(HTTP_STATUS_OK).send(screenshots);
            });
        });

        

        this.router.post('/user/changeusername', async (req: Request, res: Response, next): Promise<void> => {
            const oldUsername: string = req.body.old;
            const newUsername = req.body.newU;
            this.loginService.changeUsername(oldUsername,newUsername).then((isValid) =>{
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            })
        });
    }
}
