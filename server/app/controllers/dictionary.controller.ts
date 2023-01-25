import { HTTP_STATUS_CREATED, HTTP_STATUS_NOT_ACCEPTABLE, HTTP_STATUS_OK, HTTP_STATUS_SERVER_ERROR } from '@app/constants/constants';
import { Dictionary } from '@app/interfaces/dictionary';
import { DictionaryManager } from '@app/services/dictionary.service';
import { Request, Response, Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { Service } from 'typedi';

@Service()
export class DictionaryController {
    router: Router;
    data: Dictionary;

    constructor(public dictionaryManager: DictionaryManager) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/send', (req: Request, res: Response) => {
            const file = req.files?.fileKey as UploadedFile;
            if (this.dictionaryManager.isDictionaryValid(file)) {
                this.dictionaryManager.uploadFile(file);
                res.json(HTTP_STATUS_CREATED);
                res.sendStatus(HTTP_STATUS_CREATED);
            } else {
                res.sendStatus(HTTP_STATUS_NOT_ACCEPTABLE);
            }
        });

        this.router.get('/title/:title', async (req: Request, res: Response) => {
            try {
                const dictionary: Dictionary = this.dictionaryManager.getDictionary(req.params.title);
                res.status(HTTP_STATUS_OK).json(dictionary);
            } catch (error) {
                res.status(HTTP_STATUS_SERVER_ERROR).send(error);
            }
        });
        this.router.delete('/title/:title', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            try {
                this.dictionaryManager.deleteDictionary(req.params.title);
                res.sendStatus(HTTP_STATUS_OK);
            } catch (error) {
                res.status(HTTP_STATUS_SERVER_ERROR).send(error);
            }
        });

        this.router.get('/all', (req: Request, res: Response) => {
            res.json(this.dictionaryManager.getAllDictionaries());
            res.status(HTTP_STATUS_OK);
        });

        this.router.put('/file/:oldDict', async (req: Request, res: Response) => {
            const dictionnaryData: Dictionary = req.body;
            try {
                this.dictionaryManager.editDictionary(req.params.oldDict, dictionnaryData);
                res.sendStatus(HTTP_STATUS_OK);
            } catch (error) {
                res.status(HTTP_STATUS_SERVER_ERROR).send(error);
            }
        });

        this.router.delete('/reset', async (req: Request, res: Response) => {
            this.dictionaryManager.resetDictionaries();

            res.sendStatus(HTTP_STATUS_OK);
        });
    }
}
