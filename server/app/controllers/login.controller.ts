import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED, loginInfos } from '@app/constants/constants';
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

        this.router.put('/user', async (req: Request, res: Response, next): Promise<void> => {
            const newAccountInfos: loginInfos = req.body;
            this.loginService.createNewAccount(newAccountInfos).then((isValid): void => {
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            });
        });
    }
}
