import { HttpException } from '@app/classes/http.exception';
import { DateController } from '@app/controllers/date.controller';
import { ExampleController } from '@app/controllers/example.controller';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { BestScoresController } from './controllers/best-scores.controller';
import { DictionaryController } from './controllers/dictionary.controller';
import { GameHistoryController } from './controllers/game-history.controller';
import { VirtualPlayerCollectorController } from './controllers/virtual-player-collector.controller';
import { loginController } from './controllers/login.controller';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const fileupload = require('express-fileupload');
import * as fileupload from 'express-fileupload';
import { ChannelController } from './controllers/channels.controller';
import { iconController } from './controllers/icons.controller';
import { securityController } from './controllers/security.controller';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    constructor(
        private readonly exampleController: ExampleController,
        private readonly dateController: DateController,
        private readonly virtualPlayerCollectorController: VirtualPlayerCollectorController,
        private readonly bestScoreController: BestScoresController,
        private readonly dictionaryController: DictionaryController,
        private readonly gameHistoryController: GameHistoryController,
        private readonly loginController : loginController,
        private readonly channelController : ChannelController,
        private readonly iconController : iconController,
        private readonly securityController : securityController,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/example', this.exampleController.router);
        this.app.use('/api/virtualPlayer', this.virtualPlayerCollectorController.router);
        this.app.use('/api/date', this.dateController.router);
        this.app.use('/api/bestScore', this.bestScoreController.router);
        this.app.use('/api/dictionary', this.dictionaryController.router);
        this.app.use('/api/gameHistory', this.gameHistoryController.router);
        this.app.use('/api/virtualPlayer', this.virtualPlayerCollectorController.router);
        this.app.use('/api/login',this.loginController.router);
        this.app.use('/api/security',this.securityController.router);
        this.app.use('/api/channels',this.channelController.router);
        this.app.use('/api/icons',this.iconController.router);
        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(fileupload());
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
