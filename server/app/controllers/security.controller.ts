import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { HTTP_STATUS_OK,} from '@app/constants/constants';
import { SecurityService } from '@app/services/security-questions.service';

@Service()
export class securityController {
    router: Router;

    constructor(private securityService: SecurityService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/questions',async (req: Request, res: Response, next): Promise<void> => {
            this.securityService.getAllQuestions().then((question): void =>{
                res.status(HTTP_STATUS_OK).send(question);
            })
        });
        
        this.router.get('/questions/:index',async (req: Request, res: Response, next): Promise<void> => {
            const index : number = Number(req.params.username);
            this.securityService.getSecurityQst(index).then((question): void =>{
                res.status(HTTP_STATUS_OK).send(question);
            })
        });
    }
}