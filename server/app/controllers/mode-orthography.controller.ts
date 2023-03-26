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

        this.router.get('/scoreOrthography/:username', async (req: Request, res: Response, next): Promise<void> => {
            try {
                const username = req.params.username;
                console.log(username);
                const score = await this.modeOrthographyService.getBestScore(username);
                console.log("SCORE DANS CONTROLLER");
                console.log(score);
                console.log(res);
                res.send({bestScore: score });
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

}

}