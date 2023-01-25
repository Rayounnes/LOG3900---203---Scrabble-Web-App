import { Dictionary } from '@app/interfaces/dictionary';
import { ACCENTS, SPACE } from '@app/constants/special-characters';
import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs';
import { Service } from 'typedi';

@Service()
export class DictionaryManager {
    dictionaries: Dictionary[] = [];
    dictionary: Dictionary[] = [];

    uploadFile(file: UploadedFile) {
        try {
            file.mv('./assets/' + file.name);
        } catch (e) {
            throw new Error("Le dictionnaire n'a pas pu être effacé" + e.message);
        }
    }

    getAllDictionaries() {
        this.dictionaries = [];
        const files = this.getListOfFiles;
        console.log(files);
        for (let i = 0; i < files.length; i++) {
            this.dictionaries.push(JSON.parse(fs.readFileSync('../server/assets/' + files[i], { encoding: 'utf8', flag: 'r' })));
            this.dictionaries[i].words = [];
            this.dictionaries[i].fileName = files[i];
        }
        return this.dictionaries;
    }

    getDictionary(fileName: string) {
        try {
            const data: Dictionary = JSON.parse(fs.readFileSync('../server/assets/' + fileName, { encoding: 'utf8', flag: 'r' }));
            return data;
        } catch (e) {
            throw new Error('Impossible de trouver le fichier cherché');
        }
    }
    deleteDictionary(fileName: string): void {
        try {
            fs.unlinkSync('../server/assets/' + fileName);
        } catch (e) {
            throw new Error("Le dictionnaire n'a pas pu être effacé" + e.message);
        }
    }
    editDictionary(fileName: string, dictionary: Dictionary): void {
        const assetsPath = '../server/assets/';
        let data;
        try {
            data = fs.readFileSync(assetsPath + fileName);
        } catch (err) {
            throw new Error('Impossible de trouver le dictionnaire à modifier');
        }
        const json = data.toString();
        const dictionaryToModify: Dictionary = JSON.parse(json);
        dictionaryToModify.title = dictionary.title;
        dictionaryToModify.description = dictionary.description;
        const newJson = JSON.stringify(dictionaryToModify);
        fs.unlinkSync(assetsPath + fileName);
        fs.writeFileSync('../server/assets/' + fileName, newJson, 'utf8');
    }
    resetDictionaries(): void {
        const filesNamesList = this.getListOfFiles;
        console.log(filesNamesList);
        const assetsPath = '../server/assets/';
        for (const fileName of filesNamesList) {
            if (fileName !== 'dictionnary.json') {
                try {
                    fs.unlinkSync(assetsPath + fileName);
                } catch {
                    throw new Error("Impossible de supprimer les fichiers d'assets");
                }
            }
        }
    }
    get getListOfFiles() {
        return fs.readdirSync('assets');
    }

    isDictionaryValid(file: UploadedFile) {
        const data: Dictionary = JSON.parse(file.data.toString());

        return (
            this.isTitleUnique(data.title) &&
            this.containsAtLeast2Letter(data.words) &&
            this.hasNoSpaces(data.words) &&
            this.hasNoAccents(data.words) &&
            this.isFileNameUnique(file.name) &&
            this.isComplete(data) &&
            this.notContainsDuplicate(data.words)
        );
    }

    /** ******************Verification******************** */

    isFileNameUnique(fileName: string) {
        const files = this.getListOfFiles;
        console.log(files);
        for (const file of files) {
            if (fileName === file) return false;
        }
        return true;
    }

    isTitleUnique(newTitle: string) {
        const files = this.getListOfFiles;
        for (const file of files) {
            const oldData: Dictionary = JSON.parse(fs.readFileSync('../server/assets/' + file, { encoding: 'utf8', flag: 'r' }));
            if (oldData.title === newTitle) {
                return false;
            }
        }
        return true;
    }

    isComplete(data: Dictionary) {
        if (data.description && data.title && data.words.length > 0) return true;
        return false;
    }

    notContainsDuplicate(words: string[]) {
        const depulicatesRemoved = new Set(words);
        if (depulicatesRemoved.size !== words.length) return false;
        return true;
    }

    containsAtLeast2Letter(words: string[]): boolean {
        for (const element of words) {
            if (element.length < 2) return false;
        }
        return true;
    }

    hasNoSpaces(words: string[]) {
        for (const element of words) {
            if (SPACE.test(element)) return false;
        }
        return true;
    }

    hasNoAccents(words: string[]) {
        for (const element of words) {
            if (ACCENTS.test(element)) return false;
        }
        return true;
    }
}
