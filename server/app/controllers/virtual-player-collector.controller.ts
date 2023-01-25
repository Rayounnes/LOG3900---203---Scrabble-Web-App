import { HTTP_STATUS, HTTP_STATUS_ACCEPTED, HTTP_STATUS_CREATED, HTTP_STATUS_OK, VPlayerLevel } from '@app/constants/constants';
import { VPlayerName } from '@app/interfaces/virtual-player';
import { VirtualPlayerCollectorService } from '@app/services/virtual-player-collector.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class VirtualPlayerCollectorController {
    router: Router;

    constructor(private readonly virtualPlayerCollectorService: VirtualPlayerCollectorService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/expert/send', async (req: Request, res: Response, next) => {
            const name: VPlayerName = req.body as VPlayerName;
            await this.virtualPlayerCollectorService
                .addName(name, VPlayerLevel.Expert)
                .then(() => res.sendStatus(HTTP_STATUS_CREATED))
                .catch((error) => next(error));
        });
        this.router.post('/beginner/send', async (req: Request, res: Response, next) => {
            const name: VPlayerName = req.body as VPlayerName;
            await this.virtualPlayerCollectorService
                .addName(name, VPlayerLevel.Beginner)

                .then(() => res.sendStatus(HTTP_STATUS_CREATED))
                .catch((error) => next(error));
        });

        this.router.get('/expert/all', async (req: Request, res: Response, next) => {
            await this.virtualPlayerCollectorService
                .getAllVirtualPlayersNames(VPlayerLevel.Expert)

                .then((names) => res.status(HTTP_STATUS_OK).json(names))
                .catch((error) => next(error));
        });

        this.router.get('/beginner/all', async (req: Request, res: Response, next) => {
            await this.virtualPlayerCollectorService
                .getAllVirtualPlayersNames(VPlayerLevel.Beginner)

                .then((names) => res.status(HTTP_STATUS_OK).json(names))
                .catch((error) => next(error));
        });

        this.router.put('/beginner/modifyName/:oldName', async (req: Request, res: Response, next) => {
            const newVirtualPlayer: VPlayerName = req.body;
            this.virtualPlayerCollectorService
                .modifyName(req.params.oldName, newVirtualPlayer, VPlayerLevel.Beginner)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.put('/expert/modifyName/:oldName', async (req: Request, res: Response, next) => {
            const newVirtualPlayer: VPlayerName = req.body;
            this.virtualPlayerCollectorService
                .modifyName(req.params.oldName, newVirtualPlayer, VPlayerLevel.Expert)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.delete('/beginner/delete/:name', async (req: Request, res: Response, next) => {
            this.virtualPlayerCollectorService
                .deleteName(req.params.name, VPlayerLevel.Beginner)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.delete('/expert/delete/:name', async (req: Request, res: Response, next) => {
            this.virtualPlayerCollectorService
                .deleteName(req.params.name, VPlayerLevel.Expert)
                .then(() => res.sendStatus(HTTP_STATUS_OK))
                .catch((error) => next(error));
        });

        this.router.delete('/reset', async (req: Request, res: Response) => {
            await this.virtualPlayerCollectorService
                .resetAllVirtualPlayers()
                .then(() => {
                    res.status(HTTP_STATUS_ACCEPTED).send();
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS).send(error.message);
                });
        });
    }
}
