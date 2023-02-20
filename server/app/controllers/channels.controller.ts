import { ChannelService } from "@app/services/channels.service"; 
import { Request, Response, Router } from 'express';
import { Service } from "typedi";






@Service()

export class ChannelController{

    router: Router;

    constructor(private channelService: ChannelService ) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/channel/:username', async (req: Request, res: Response, next): Promise<void> => {
            let username = req.params.username;
            this.channelService.getUserChannels(username).then((userChannels)=>{
                console.log(userChannels)
            })
        });

        
    }

}