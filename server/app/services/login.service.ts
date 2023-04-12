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

    async getUserCoins(username : string) : Promise<number[]>{
        let user = await this.userCollection.findOne({username : username})
        if(user && user['coins']){
            return [user['coins']]
        }else{
            await this.userCollection.updateOne({username : username},{$set : {coins : 0}})
            return [0]
        }
    }

    async addCoinsToUser(username : string, coinsToAdd : number) : Promise<boolean>{
        let user = await this.userCollection.findOne({username : username})
        if(user){
            let currentCoins = user['coins']
            this.userCollection.updateOne({username : username},{$set : {coins : currentCoins + coinsToAdd}});
            return true;
        }
        return false;
        
    }

    async addScreenshotToUser(username : string, image : string, comment : string) : Promise<boolean>{
        let user = await this.userCollection.findOne({username : username})
        if(user){
            if(user['screenshots']){
                let current = user['screenshots']
                current.push([image,comment])
                await this.userCollection.updateOne({username : username},{$set :{screenshots : current}})
                return true;
            }else{
                await this.userCollection.updateOne({username : username},{$set :{screenshots : [[image,comment]]}})
                return true
            }
        }
        return false
    }

    async getUserScreenShots(username : string){
        let user = await this.userCollection.findOne({username : username})
        if(user){
            if(user['screenshots']){
                return user['screenshots']
            }else{
                await this.userCollection.updateOne({username : username},{$set :{screenshots : []}})
            }
        }
        return []
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

    async getSecurityAnswer(username : string){
        let document = await this.userCollection.findOne({username : username});
        if(document){
            return document['securityAnswer'];
        }else{
            return '';
        }
    }

    async getSecurityId(username : string){
        let document = await this.userCollection.findOne({username : username});
        if(document){
            return document['securityQstId'];
        }else{
            return '';
        }
    }

    adjustStringFormat(username: string){
        let end = username.lastIndexOf('"');
        let start = username.indexOf('"') + 1;
        let result = username.substring(start, end);
        return result;
    }

    async changePassword(username: string, newPassword: string, isLightClient? : boolean) {
        //Le String du client léger vient en double comme ça --> '"user"'
        if(isLightClient) {
            username = this.adjustStringFormat(username);
            newPassword = this.adjustStringFormat(newPassword);
        }
        let user = await this.userCollection.findOne({ username: username });

        if (user) {
            if (user['connected']) {return false;}
            await this.userCollection.updateOne(
                { username: username },
                { $set: { password: newPassword } }
            );
            return true;
        }else {
           return false;
        }
      }

    async updateUserGameCount(username : string){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['numberOfGames']){
            let newNumberOfGames : number = player['numberOfGames'] + 1
            await this.userCollection.updateOne({username : username},{$set : {numberOfGames : newNumberOfGames}})
            return newNumberOfGames;
        }else{
            let newNumberOfGames : number =  1
            await this.userCollection.updateOne({username : username},{$set : {numberOfGames : newNumberOfGames}});
            return newNumberOfGames;
        }
    }

    async getUserGameCount(username : string){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['numberOfGames']){
            let numberOfGames : number = player['numberOfGames']
            return numberOfGames
        }else{
            await this.userCollection.updateOne({username : username},{$set : {numberOfGames : 0}});
            return 0
        }
    }

    async updateUserGameWon(username : string){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['gamesWon']){
            let newNumberOfGames : number = player['gamesWon'] + 1
            await this.userCollection.updateOne({username : username},{$set : {gamesWon : newNumberOfGames}})
            return newNumberOfGames;
        }else{
            let newNumberOfGames : number =  1
            await this.userCollection.updateOne({username : username},{$set : {gamesWon : newNumberOfGames}});
            return newNumberOfGames;
        }
    }

    async getUserGameWon(username : string){
        let player = await this.userCollection.findOne({ username: username });
        if(player &&  player['gamesWon']){
            let numberOfGames : number = player['gamesWon']
            return numberOfGames
        }else{
            let newNumberOfGames : number =  0
            await this.userCollection.updateOne({username : username},{$set : {gamesWon : newNumberOfGames}});
            return newNumberOfGames;
        }
    }

    async updateUserPointsMean(username : string, points : number){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['points'] != undefined){
            let old = player['points'];
            let newMean = Math.floor((old+points)/player['numberOfGames']);
            await this.userCollection.updateOne({username : username},{$set : {points : newMean}});
        }else{
            await this.userCollection.updateOne({username : username},{$set : {points : points}});
        }
    }

    async getUserPointsMean(username : string) : Promise<number>{
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['points'] != undefined){
            return player['points'];
        }else{
            await this.userCollection.updateOne({username : username},{$set : {points : 0}});
            return 0
        }
    }

    async updateUserTimeAverage(username : string, duration : number){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['timeAverage']){
            const oldAverage = player['timeAverage'].split(' ')
            const oldMinutes = parseInt(oldAverage[0], 10);
            const oldSeconds = parseInt(oldAverage[2], 10);
            const oldTime = oldMinutes * 60 + oldSeconds;

            let newAverage = (oldTime+duration)/player['numberOfGames']
            const newMinutes = Math.floor(newAverage / 60);
            const newSeconds = Math.floor(newAverage % 60);
            const newTime = `${newMinutes} m ${newSeconds} s`;

            await this.userCollection.updateOne({username : username},{$set : {timeAverage : newTime}});
        }else{
            const newMinutes = Math.floor(duration / 60);
            const newSeconds = Math.floor(duration % 60);
            const newTime = `${newMinutes} m ${newSeconds} s`;
            await this.userCollection.updateOne({username : username},{$set : {timeAverage : newTime}});
        }
    }

    async getUserTimeAverage(username : string){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['timeAverage']){
            let timeAverage = player['timeAverage'].split(" ").join("")// De "1 m 30 s" a "1m30s"
            return timeAverage
        }else{
            await this.userCollection.updateOne({username : username},{$set : {timeAverage : "0 m 0 s"}});
            return "0m0s"
        }
    }

    async getUserGameHistory(username : string){
        let player = await this.userCollection.findOne({ username: username });
        if(player && player['gameHistory']){
            let gameHistory = player['gameHistory'];
            return gameHistory
        }else{
            await this.userCollection.updateOne({username : username},{$set : {gameHistory : []}})
            return []
        }
    }

    async updateUserGameHistory(username : string, gameWin : boolean){
        let player = await this.userCollection.findOne({username :  username});
        if(player && player['gameHistory']){
            let gameHistory = player['gameHistory'];
            gameHistory.push([new Date().toLocaleString(),gameWin])
            await this.userCollection.updateOne({username : username},{$set : { gameHistory : gameHistory}})
        }else{
            let gameHistory = [new Date().toLocaleString(),gameWin]
            await this.userCollection.updateOne({username : username},{$set : { gameHistory : [gameHistory]}})
        }
    }

    async getUserConfigs(username : string){
        let player = await this.userCollection.findOne({username :  username});
        if(player && player['configs']){
            let configs = player['configs'];
            return configs
        }else{
            let configs = {langue : "fr", theme : "white"}
            await this.userCollection.updateOne({username : username},{$set : { configs : configs}});
            return configs
        }
    }

    async updateUserConfigs(username : string, newConfig : any){
        let player = await this.userCollection.findOne({username :  username});
        if(player){
            await this.userCollection.updateOne({username : username},{$set : { configs : newConfig}});
        }
        
    }

    async changeUsername(oldUsername : string, newUsername : string, isLightClient? : boolean) : Promise<boolean>{
        if(isLightClient){
            oldUsername = this.adjustStringFormat(oldUsername);
            newUsername = this.adjustStringFormat(newUsername);
        }

        let usernameExists = await this.userCollection.findOne({ username: newUsername });
        if(usernameExists){
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
