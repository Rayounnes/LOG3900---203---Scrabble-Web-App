import { expect, assert } from 'chai';
import { HelpCommandService } from './help-command.service';

describe('HelpCommandService', () => {
    let service: HelpCommandService;
    beforeEach(() => {
        service = new HelpCommandService();
    });
    it('should be created', () => {
        assert.isDefined(service);
    });

    it('helpCommand should return a text with the commands and their description', () => {
        const commandDescription = "!aide: Permet d'obtenir une description des commandes disponibles.";
        const helpMessage = service.helpCommand().name;
        expect(helpMessage).to.contain(commandDescription);
    });
});
