import { GameHistory } from '@app/interfaces/game-historic-info';
import { HTTP_STATUS_CREATED, HTTP_STATUS_OK } from '@app/constants/constants';
import { GameHistoryService } from '@app/services/game-history.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_ACCEPTED = 202;
const HTTP_STATUS = 203;

@Service()
export class GameHistoryController {
    router: Router;

    constructor(private readonly gameHistoryService: GameHistoryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/send', async (req: Request, res: Response) => {
            const gameHistory: GameHistory = req.body;
            await this.gameHistoryService.addGameHistory(gameHistory).then(() => res.sendStatus(HTTP_STATUS_CREATED));
        });

        this.router.get('/all', async (req: Request, res: Response) => {
            await this.gameHistoryService.getGameHistory().then((gamesHistory) => res.status(HTTP_STATUS_OK).json(gamesHistory));
        });
        this.router.delete('/reset', async (req: Request, res: Response) => {
            await this.gameHistoryService
                .resetGameHistory()
                .then(() => {
                    res.status(HTTP_STATUS_ACCEPTED).send();
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS).send(error.message);
                });
        });
    }
}
