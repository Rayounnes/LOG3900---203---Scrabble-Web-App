
import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_CHANNEL } from '@app/constants/constants';
import { DB_COLLECTION_USERS } from '@app/constants/constants';

@injectable()
@Service()
export class ChannelService{
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get channelCollection()  {
        return this.databaseService.database.collection(DB_COLLECTION_CHANNEL)

    }

    get userCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_USERS);
    }

    async getUserChannelsName(username : string){

        let document = await this.userCollection.findOne({ username: username });
        if(document){
            return document['channels'];
        }
        return null
        
    }

    async getUserChannels(username : string) : Promise<any[]>{
        let userChannels : any[] = []
        await this.getUserChannelsName(username).then(async (userChannelsName) =>{
            userChannels = await this.channelCollection.find({name : { $in : userChannelsName }}).toArray()
        });
        return userChannels
        

    }








}