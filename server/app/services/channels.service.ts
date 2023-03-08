
import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_CHANNEL } from '@app/constants/constants';
import { DB_COLLECTION_USERS } from '@app/constants/constants';
import { ChatMessage } from '@app/interfaces/chat-message';

@injectable()
@Service()
export class ChannelService {
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
        return allChannelsName;
    }

    async getAllUsers() {
        let allUsers = await this.userCollection.find().toArray();
        let allUsersChannel = allUsers.map((obj) => obj.channels);
        return allUsersChannel;
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

    async joinExistingChannels(channelsNames : string | string[], username : string){
        let user = await this.userCollection.findOne({ username: username });
        if(user){
            if(Array.isArray(channelsNames)){
                for(let channelName of channelsNames){
                    await this.userCollection.updateOne({ _id: user['_id'] }, { $addToSet: { channels: channelName } });
                }
            }
            else {
                await this.userCollection.updateOne({ _id: user['_id'] }, { $addToSet: { channels: channelsNames } });
            }
        }
    }
    

    async leaveChannel(channelName : string, username : string){
        let user = await this.userCollection.findOne({ username: username });
        if(user){
            let currentChannels = user["channels"] as string[]
            let index = currentChannels.indexOf(channelName)
            currentChannels.splice(index,1);
            await this.userCollection.updateOne({_id : user["_id"]},{ $set: { channels: currentChannels } })
        }
    }

    async deleteChannel(channelName : string){
        let users = await this.userCollection.find({channels : {$in : [channelName]}}).toArray() as any[]
        for(let user of users){
            await this.leaveChannel(channelName,user['username']);
        }

        await this.channelCollection.deleteOne({name : channelName});
    }

    async getMessagesOfChannel(channelName: string) {
        const channel = await this.channelCollection.findOne({ name: channelName });
        if (channel) {
            return channel['messages'];
        }
        return null;
    }











}