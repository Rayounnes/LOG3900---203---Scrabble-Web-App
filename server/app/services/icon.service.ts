import { inject, injectable } from 'inversify';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';
import types from '@app/types';
import { DB_COLLECTION_ICONS} from '@app/constants/constants';

@injectable()
@Service()
export class iconService {
    constructor(@inject(types.DatabaseService) private databaseService: DatabaseService) {}


    get iconsCollection() {
        return this.databaseService.database.collection(DB_COLLECTION_ICONS);
    }

    async addIcon( icon : string,username : string){
        let query = {icon : icon,creator : username}
        let iconExists = await this.iconsCollection.findOne(query);
        if(iconExists){
            return false;
            
        }else{
            await this.addIconToDB(icon,username);
            return true;
        }
    }

    async getIcons(username : string){
        let query  = {
            $or: [
              { personal: true, creator : username },
              { personal: false }
            ]
        };

        let icons = await this.iconsCollection.find(query).toArray();
        let iconsArray = icons.map(obj => obj.icon)
        return iconsArray
    }

    async getUserIcon(username : string){
        let icon = await this.iconsCollection.findOne({active : username})
        
        if(icon){
            return [icon['icon']]
        }
        return ""
    }

    private async addIconToDB( icon : string,username : string) {
        let newIcon = { icon: icon, active: [], personal: true, creator : username };
        await this.iconsCollection.insertOne(newIcon);
    }
    
}