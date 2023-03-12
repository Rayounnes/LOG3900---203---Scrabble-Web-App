import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED} from '@app/constants/constants';
import { iconService } from '@app/services/icon.service';

@Service()
export class iconController {
    router: Router;

    constructor(private iconService: iconService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        console.log("la")
        this.router.post('/add',async (req: Request, res: Response, next): Promise<void> => {
            const icon : string = JSON.parse(req.body.image);
            const username : string = JSON.parse(req.body.username);
            this.iconService.addIcon(icon,username).then((isValid): void =>{
                res.status(isValid ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(isValid);
            })
        });
        this.router.get('/get/:username',async (req: Request, res: Response, next): Promise<void> => {
            const icon : string = req.params.username;
            this.iconService.getIcons(icon).then((icons): void =>{
                res.status(icons ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(icons);
            })
        });
        this.router.get('/getusericon/:username',async (req: Request, res: Response, next): Promise<void> => {
            const username : string = req.params.username;
            this.iconService.getUserIcon(username).then((icon : string[] ): void =>{
                res.status(icon ? HTTP_STATUS_OK : HTTP_STATUS_UNAUTHORIZED).send(icon);
            })
        });
        
        


        
    }
}