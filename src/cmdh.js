// ** Dependancies **

const fs = require('fs'); // File I/O
const embed = require('./homiesEmbed');

class CommandHandler {
    constructor(client) {
        this.LoadedCommands = {};
        this.client = client;
    };

    /**
     * Initializes the CommandHandler with command data.
     * 
     * @returns void
     */
    Initialize() {
        let files = fs.readdirSync(__dirname + "/commands");
        files.forEach(file => {
            let filename = file.split('.');
            if (filename[1] == 'js') {
                this.LoadedCommands[filename[0]] = require(`./commands/${filename[0]}`);
            }
        })
    }

    /**
     * 
     * @param {string} cmd 
     * 
     * @returns boolean
     */
    Exists(cmd) {
        return (this.LoadedCommands[cmd.toLowerCase()] !== null &&
            this.LoadedCommands[cmd.toLowerCase()] !== undefined);
    }

    /**
     * This method attempts to run a command if found.
     * 
     * @param {string} cmd 
     * @param {*} args : Array
     * 
     * @returns boolean
    */
    Run(message, cmd, args) {
        let command = this.LoadedCommands[cmd.toLowerCase()];
        if (command !== null && command !== undefined) {
            try {
                command.exe(message, this.client, ...args);
                return true;
            } catch (err) {
                console.warn(`An error occured trying to run ${cmd}: \t\t ${err}`);
                embed(this.client, e => {
                    e.color = 0xeb4034;
                    e.description = `${err}`;
                    e.title = `Could not run ${cmd.toLowerCase()}`;
                    e.footer.text = "An error occured.";
                    message.channel.send({
                        embeds: [e],
                    })
                        .catch(console.error);
                });
                return false;
            }
        } else {
            throw new Error("Attempt to run null command.");
        }
    }
}

module.exports = { CommandHandler };
