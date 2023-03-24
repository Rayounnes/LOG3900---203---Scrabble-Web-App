import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_SECURITY_QST} from '@app/constants/constants';

@injectable()
@Service()
export class SecurityService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}


    get securityCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_SECURITY_QST);
    }

    async getAllQuestions(){
        let document = await this.securityCollection.find({}).toArray();
        return document['questions'];
    }

    async getSecurityQst(index : number){
        let document = await this.securityCollection.find({}).toArray();
        let securityQst = document['questions'];
        return securityQst[index];
    }

}
