import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_ICONS, DB_COLLECTION_USERS } from '@app/constants/constants';
import { loginInfos } from '@app/constants/constants';
import { ChannelService } from './channels.service';

@injectable()
@Service()
export class LoginService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService, private channelService : ChannelService) {}

    get userCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_USERS);
    }
    get iconsCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_ICONS);
    }

    async checkLoginValidity(loginInfos: loginInfos): Promise<boolean> {
        let isValid: boolean;
        let document = await this.userCollection.findOne({ username: loginInfos.username });
        if (document && document['password'] == loginInfos.password && !document['connected']) {
            // this.changeConnectionState(loginInfos.username, true);
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid;
    }

    async createNewAccount(loginInfos: loginInfos): Promise<boolean> {
        let usernameExists = await this.userCollection.findOne({ username: loginInfos.username });
        let emailExists  = await this.userCollection.findOne({ email: loginInfos.email });
        if (usernameExists || emailExists) {
            return false;
        } else {
            await this.updateAddedIcons(loginInfos.socket as string,loginInfos.username);
            await this.updateSelectedIcon(loginInfos.icon as string,loginInfos.username)
            await this.addAccount(loginInfos);
            return true;
        }
    }

    private async addAccount(accountInfos: loginInfos) {
        let newAccount = { username: accountInfos.username, password: accountInfos.password, connected: true, channels :  ["General"] , email : accountInfos.email, connexions : [], securityQstId: accountInfos.qstIndex, securityAnswer : accountInfos.qstAnswer};
        await this.userCollection.insertOne(newAccount);
    }

    private async updateAddedIcons(socketId : string, username : string){
        let icons = await this.iconsCollection.find({creator : socketId}).toArray()
        if(icons.length > 0){
            for(let icon of icons){
                await this.iconsCollection.updateOne({_id : icon["_id"]},{ $set: {creator : username}})
            }
        }
    }

    private async updateSelectedIcon(iconChoosed : string, username : string){
        let icon = await this.iconsCollection.findOne({icon : iconChoosed});
        if(icon)
        await this.iconsCollection.updateOne({_id : icon["_id"]},{ $push: { active: username } })
    }

    async changeConnectionState(username: string, state: boolean) {
        var newvalues = { $set: { connected: state } };
        await this.databaseService.database.collection(DB_COLLECTION_USERS).updateOne({ username: username }, newvalues);
        await this.userCollection.updateOne({ username: username },{ $push: {connexions : [new Date().toLocaleString(),state ]}});
    }

    async getConnexionHistory(username : string){
        let history = await this.userCollection.findOne({username : username});
        if(history){
            return history['connexions']
        }else{
            return []
        }
    }

    async getSecurityInfos(username : string, query : string){
        let document = await this.userCollection.findOne({username : username});
        console.log(document,'SERVICEEE')
        if(document){
            return document[query];
        }else{
            return '';
        }
    }

    async changePassword(username : string, password : string){
        try {
            let document = await this.userCollection.findOne({username : username});
            if(document!['connected'] == true) return false;
            await this.userCollection.updateOne({username : username},{$set : {password : password}});
            return true
        } catch (error) {
            return false;
        }
    }

    async changeUsername(oldUsername : string, newUsername : string) : Promise<boolean>{
        let usernameExists = await this.userCollection.findOne({ username: newUsername });
        if(usernameExists){
            console.log("fauxxxx")
            return false;
        }else{
            //Update le nom du username dans la collection Users
            await this.userCollection.updateOne({username: oldUsername},{$set : {username : newUsername}})

            //On modifie le field "creator" de tout les icons que ce user a créé
            let avatars = await this.iconsCollection.find({creator : oldUsername}).toArray();
            if(avatars.length > 0){
                for(let avatar of avatars){
                    this.iconsCollection.updateOne({_id : avatar["_id"]},{$set : {creator : newUsername}});
                }
            }

            //On enleve l'ancien username du array 'active' de l'icon du username, et on push le nouveau username dans l'array
            let currentIcon = await this.iconsCollection.findOne({active : oldUsername});
            if(currentIcon){
                let usersWithIcon = currentIcon['active'] as string[];
                usersWithIcon = usersWithIcon.filter(username => username != oldUsername);
                usersWithIcon.push(newUsername);
                this.iconsCollection.updateOne({_id : currentIcon["_id"]},{$set : {active : usersWithIcon}})
            }

            //On modifie tout les messages qui ont été envoyés par ce user dans tout ses channels, afin de mettre le nouveau nom.
            //Si on ne fait pas ca, le user verra les anciens messages qu'il a emmener dans un channel avec son ancien username comme si ce sont des messages de quelqu'un d'autre
            let userChannels = await this.channelService.getUserChannels(newUsername);
            for(let channel of userChannels){
                for(let message of channel['messages']){
                    if(typeof(message) == "object" && message['username'] == oldUsername){
                        message['username'] = newUsername
                    }
                }
                await this.channelService.channelCollection.updateOne({_id : channel["_id"]},{$set : {messages : channel['messages']}})
            }



            return true
        }
    }
}
