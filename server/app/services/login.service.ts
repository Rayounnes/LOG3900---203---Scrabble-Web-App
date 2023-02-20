import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_USERS } from '@app/constants/constants';
import { loginInfos } from '@app/constants/constants';

@injectable()
@Service()
export class LoginService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}

    get userCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_USERS);
    }

    async checkLoginValidity(loginInfos: loginInfos): Promise<boolean> {
        let isValid: boolean;
        let document = await this.userCollection.findOne({ username: loginInfos.username });
        if (document && document['password'] == loginInfos.password && !document['connected']) {
            this.changeConnectionState(loginInfos.username, true);
            isValid = true;
        } else {
            isValid = false;
        }
        return isValid;
    }

    async createNewAccount(loginInfos: loginInfos): Promise<boolean> {
        let usernameExists = await this.userCollection.findOne({ username: loginInfos.username });
        if (usernameExists) {
            return false;
        } else {
            await this.addAccount(loginInfos);
            return true;
        }
    }

    private async addAccount(accountInfos: loginInfos) {
        let newAccount = { username: accountInfos.username, password: accountInfos.password, connected: true, channels :  ["General"] };
        await this.userCollection.insertOne(newAccount);
    }

    async changeConnectionState(username: string, state: boolean) {
        var newvalues = { $set: { connected: state } };
        await this.databaseService.database.collection(DB_COLLECTION_USERS).updateOne({ username: username }, newvalues);
    }
}
