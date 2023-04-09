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

        this.router.get('/allWordsOrthography/:langue', async (req: Request, res: Response, next): Promise<void> => {
            const langue = req.params.langue
            this.modeOrthographyService.getAllWords(langue).then((word) => {
                res.send(word);
            })
        });


        this.router.get('/allBestScores', async (req: Request, res: Response, next): Promise<void> => {
            this.modeOrthographyService.getAllBestScore().then((word) => {
                res.send(word);
            })
        });

        this.router.get('/scoreOrthography/:username', async (req: Request, res: Response, next): Promise<void> => {
            try {
                const username = req.params.username;
                const score = await this.modeOrthographyService.getBestScore(username);
                res.status(200).send({bestScore: score });
            } catch (err) {
                console.error(err);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

}

}