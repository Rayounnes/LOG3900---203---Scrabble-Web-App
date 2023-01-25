import { COMMAND_DESCRIPTION } from '@app/constants/constants';

export class HelpCommandService {
    helpCommand() {
        let helpMessage = '';
        for (const command of COMMAND_DESCRIPTION) {
            const commandDescription = helpMessage.concat(command + this.skipLineManager(command));
            helpMessage = commandDescription;
        }
        return { name: helpMessage, type: 'help', display: 'local' };
    }

    skipLineManager(command: string) {
        let nextLine = '\n\n';
        if (command.startsWith('!aide')) nextLine = '';
        return nextLine;
    }
}
