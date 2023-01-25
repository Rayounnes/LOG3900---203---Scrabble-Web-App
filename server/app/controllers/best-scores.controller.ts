import { HTTP_STATUS, HTTP_STATUS_ACCEPTED, HTTP_STATUS_CREATED, HTTP_STATUS_OK } from '@app/constants/constants';
import { TopScore } from '@app/interfaces/top-scores';
import { BestScoresService } from '@app/services/best-scores.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class BestScoresController {
    router: Router;

    constructor(private readonly bestScoresService: BestScoresService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/Classic/send', async (req: Request, res: Response) => {
            const topScore: TopScore = req.body;
            await this.bestScoresService.addScoreClassique(topScore).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.post('/Log2990/send', async (req: Request, res: Response) => {
            const topScore: TopScore = req.body;
            await this.bestScoresService.addScoreLog(topScore).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.get('/Classic/all', async (req: Request, res: Response) => {
            await this.bestScoresService.getTopBestScoresClassique().then((bestScoresClassic) => res.status(HTTP_STATUS_OK).json(bestScoresClassic));
        });

        this.router.get('/Log2990/all', async (req: Request, res: Response) => {
            await this.bestScoresService.getTopBestScoresLog().then((bestScoresLog) => res.status(HTTP_STATUS_OK).json(bestScoresLog));
        });
        this.router.delete('/reset', async (req: Request, res: Response) => {
            await this.bestScoresService
                .resetBestScores()
                .then(() => {
                    res.status(HTTP_STATUS_ACCEPTED).send();
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS).send(error.message);
                });
        });
    }
}
