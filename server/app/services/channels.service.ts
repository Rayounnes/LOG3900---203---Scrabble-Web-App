
import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_CHANNEL } from '@app/constants/constants';
import { DB_COLLECTION_USERS } from '@app/constants/constants';
import { ChatMessage } from '@app/interfaces/chat-message';

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

    async getAllChannels(){
        let allChannels = await this.channelCollection.find().toArray();
        let allChannelsName = allChannels.map((obj) => obj.name)
        return allChannelsName
    }

    async addMessageToChannel(message : ChatMessage) {
        let channelDocument = await this.channelCollection.findOne({name : message.channel});
        
        
        if(channelDocument){
            try{
                await this.channelCollection.updateOne({_id: channelDocument["_id"]},{ $push: { messages: message } });
                console.log("Message added to channel successfully!");
            }catch (error) {
                console.error("Error writing message to database: ", error);
            }
        }
    }

    async createNewChannel(channelName : string, username : string){
        let user = await this.userCollection.findOne({ username: username });
        if(user){
            console.log(user)
            await this.userCollection.updateOne({_id : user["_id"]},{ $push: { channels: channelName } })
        }

        let newChannel = {name : channelName, isGameChannel : false, users : [], messages : []};
        await this.channelCollection.insertOne(newChannel)
        return newChannel

    }







}