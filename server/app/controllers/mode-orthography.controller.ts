import { ModeOrthography } from "@app/services/mode-orthography.service"; 
import { Request, Response, Router } from 'express';
import { Service } from "typedi";
//import {HTTP_STATUS_OK} from '@app/constants/constants';






@Service()

export class ModeOrthographyController{

    router: Router;

    constructor(private modeOrthographyService: ModeOrthography ) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/allWordsOrthography', async (req: Request, res: Response, next): Promise<void> => {
            this.modeOrthographyService.getAllWords().then((word) => {
                res.send(word);
            })
        });
}

}