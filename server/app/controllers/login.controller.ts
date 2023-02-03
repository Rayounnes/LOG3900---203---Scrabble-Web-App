import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { HTTP_STATUS_NOT_ACCEPTABLE, HTTP_STATUS_OK, loginInfos } from '@app/constants/constants';
import { LoginService } from '@app/services/login.service';



@Service()

export class loginController{
    router: Router;


    constructor(private loginService : LoginService){
        this.configureRouter();
    }

    private configureRouter() : void {
        this.router = Router();

        this.router.get('/user/:infos', async (req: Request, res: Response, next) : Promise<void> => {
            const userLoginInfos: loginInfos = JSON.parse(req.params.infos) ; 
            this.loginService.checkLoginValidity(userLoginInfos).then((isValid) : void =>{
                res.send(isValid);
                isValid ? res.status(HTTP_STATUS_OK) : res.status(HTTP_STATUS_NOT_ACCEPTABLE);
            });
        });

        this.router.put('/user/creation', async (req: Request, res: Response, next): Promise<void> =>{
            console.log("ici")
            const newAccountInfos : loginInfos = req.body;
            this.loginService.createNewAccount(newAccountInfos).then((isValid) : void =>{
                res.send(isValid);
                isValid ? res.status(HTTP_STATUS_OK) : res.status(HTTP_STATUS_NOT_ACCEPTABLE);
            })
        })


    }

}