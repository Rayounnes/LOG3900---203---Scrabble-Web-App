import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_ICONS, DB_COLLECTION_USERS } from '@app/constants/constants';
import { loginInfos } from '@app/constants/constants';

@injectable()
@Service()
export class LoginService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

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
        console.log(loginInfos)
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
        let newAccount = { username: accountInfos.username, password: accountInfos.password, connected: true, channels :  ["General"] , email : accountInfos.email};
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
}
