import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_CHANNEL, DB_COLLECTION_USERS } from '@app/constants/constants';
import { ChatMessage } from '@app/interfaces/chat-message';

@injectable()
@Service()
export class ChannelService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get channelCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_CHANNEL);
    }

    get userCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_USERS);
    }

    async getUserChannelsName(username: string) {
        const document = await this.userCollection.findOne({ username: username });
        if (document) {
            return document['channels'];
        }
        return null;
    }

    async getUserChannels(username: string): Promise<any[]> {
        let userChannels: any[] = [];
        try {
            await this.getUserChannelsName(username).then(async (userChannelsName) => {
                userChannels = await this.channelCollection.find({ name: { $in: userChannelsName } }).toArray();
            });
        } catch (e) {
            console.log(e);
        }
        return userChannels;
    }

    async getAllChannels() {
        const allChannels = await this.channelCollection.find({ isGameChannel: false }).toArray();
        const allChannelsName = allChannels.map((obj) => obj.name);
        return allChannelsName;
    }

    async getAllUsers() {
        const allUsers = await this.userCollection.find().toArray();
        const allUsersChannel = allUsers.map((obj) => obj.channels);
        return allUsersChannel;
    }

    async addMessageToChannel(message: ChatMessage) {
        const channelDocument = await this.channelCollection.findOne({ name: message.channel });

        if (channelDocument) {
            try {
                await this.channelCollection.updateOne({ _id: channelDocument['_id'] }, { $push: { messages: message } });
            } catch (error) {}
        }
    }

    async createNewChannel(channelName: string, username: string, isGame: boolean) {
        const existing = await this.channelCollection.findOne({ name: channelName });
        if (existing) {
            return false;
        } else {
            const user = await this.userCollection.findOne({ username: username });
            if (user) {
                await this.userCollection.updateOne({ _id: user['_id'] }, { $push: { channels: channelName } });
            }

            const newChannel = { name: channelName, isGameChannel: isGame, users: 1, messages: [], creator : username };
            await this.channelCollection.insertOne(newChannel);
            return newChannel;
        }
    }

    async joinExistingChannels(channelsNames: string | string[], username: string) {
        const user = await this.userCollection.findOne({ username: username });

        if (user) {
            if (Array.isArray(channelsNames)) {
                for (const channelName of channelsNames) {
                    await this.userCollection.updateOne({ _id: user['_id'] }, { $addToSet: { channels: channelName } });
                    const membersOfChannel = await this.channelCollection.findOne({ name: channelName });
                    if (membersOfChannel) this.channelCollection.updateOne({ name: channelName }, { $set: { users: membersOfChannel['users'] + 1 } });
                }
            } else {
                await this.userCollection.updateOne({ _id: user['_id'] }, { $addToSet: { channels: channelsNames } });
                const membersOfChannel = await this.channelCollection.findOne({ name: channelsNames });
                if (membersOfChannel) this.channelCollection.updateOne({ name: channelsNames }, { $set: { users: membersOfChannel['users'] + 1 } });
            }
        }
    }

    async leaveChannel(channelName: string, username: string, tryingToQuitDuringGame : boolean) {
        const user = await this.userCollection.findOne({ username: username });
        const channel = await this.channelCollection.findOne({ name: channelName });
        if(channel && channel['isGameChannel'] && tryingToQuitDuringGame){
            //Si les 3 conditions sont a true, sa veut dire que le user essaie de quitter le channel pendant qu'une partie est en cours
            return false
        }
        if (channel) {
            var numberOfUsers = channel['users'];
        }

        if (user) {
            const currentChannels = user['channels'] as string[];
            const index = currentChannels.indexOf(channelName);
            if(index !== -1){
                currentChannels.splice(index, 1);
                await this.userCollection.updateOne({ _id: user['_id'] }, { $set: { channels: currentChannels } });
                await this.channelCollection.updateOne({ name: channelName }, { $set: { users: numberOfUsers - 1 } });
            }else{
                return false;
            }
        }
        if (numberOfUsers - 1 == 0) {
            this.deleteChannel(channelName);
        }
        return true;
    }

    async deleteChannel(channelName: string, username? : string) {

        let channel = await this.channelCollection.findOne({name : channelName});
        if(channel && channel['isGameChannel'] && username){
            return false //Si les trois conditions sont true, ca veut dire que un user a essayer de supprimer un channel de jeu, donc false;
        }

        if(username){ //Le username est optionnel, pour traiter le cas ou on veut supprimer le channel juste parceque y'a plus personne dedans
            
            if(channel && channel['creator'] == username){
                const users = (await this.userCollection.find({ channels: { $in: [channelName] } }).toArray()) as any[];
                for (const user of users) {
                    await this.leaveChannel(channelName, user['username'], false);
                }

                await this.channelCollection.deleteOne({ name: channelName });
                return true;
            }
            return false;
        }
        const users = (await this.userCollection.find({ channels: { $in: [channelName] } }).toArray()) as any[];
        for (const user of users) {
            await this.leaveChannel(channelName, user['username'], false);
        }

        await this.channelCollection.deleteOne({ name: channelName });
        return true
    }

    async getMessagesOfChannel(channelName: string) {
        const channel = await this.channelCollection.findOne({ name: channelName });
        if (channel) {
            return channel['messages'];
        }
        return null;
    }
}
