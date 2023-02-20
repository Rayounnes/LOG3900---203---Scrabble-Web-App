
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

    private async getUserChannelsName(username : string){

        let document = await this.userCollection.findOne({ username: username });
        if(document){
            return document['channels'];
        }
        return null
        
    }

    async getUserChannels(username : string){
        this.getUserChannelsName(username).then((userChannelsName) =>{
            console.log(userChannelsName)
            return this.channelCollection.find({name : { $in : userChannelsName }}).toArray()
        });
        

    }








}