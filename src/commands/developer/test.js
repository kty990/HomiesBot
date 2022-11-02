const embed = require('../../homiesEmbed.js');
const vm2 = require('vm2');

class whitelist {
    constructor() {
        // Stored using the user's ID.
        this.allowed = require('./whitelist.json')['whitelist'];
    }

    IsWhitelisted(user_id) {
        for (let id of this.allowed) {
            if (user_id === id) {
                return true;
            }
        }
        return false;
    }
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.allowed = new whitelist();

        this.name = "test";
        this.description = "In development";
        this.options = [];
        this.aliases = ["run"];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client) {
        if (!this.allowed.IsWhitelisted(message.author.id)) {
            throw new Error("This is a secret command. Only whitelisted developers and moderators have access to this command.");
        }
        let content = message.content.split(" ");
        /**
         * TODO:
         * Do check in content for illegal/unaccepted code                    INCOMPLETE
         * Run code -> Provide truncated (if necessary) output to user        INCOMPLETE
         * 
         * Input types for code:
         *      - message.content                                             COMPLETED
         *      - message attachments if filetype in [.txt]                   INCOMPLETE
         */

        content.splice(0, 1); // removes command from content

        // Do check for unaccepted code

        let result = []; // change to list
        let vm = new vm2.VM({ console: 'inherit', sandbox: { result } });

        // Run code
        vm.run(`console.log = function(value) {
            result.push(value);
        };

        ` + content.join(" "), 'vm.js');

        // try {
        //     vm.run(`console.log = function(value) {
        //         result.push(value);
        //     };

        //     ` + content.join(" ")).catch(console.error);
        // } catch (err) {
        //     let truncated = "";
        //     if (`${err}`.length > 1000) {
        //         truncated = "\n(...)";
        //     }
        //     embed(client, e => {
        //         e.color = 0xeb4034;
        //         e.description = `${`${err}`.substring(0, 1000)}${truncated}`;
        //         e.title = "Syntax Error";
        //         e.footer.text = `Command run by ${message.author.tag}`;
        //     })
        // }


        console.log(`result: ${result}`);

        embed(client, (myEmbed) => {
            myEmbed.title = `Result of ${message.author.tag}'s ${this.guildInfo.Get('prefix')}test`;

            // Truncate if necessary : 1024 char max per field value
            let remaining = result.join("\n");
            let addedChars = 0;
            while (remaining.length > 0) {
                if (remaining.length > 1024) {
                    myEmbed.fields.push(
                        {
                            name: "\u2800",
                            value: `${remaining.substring(0, 1024)}`,
                            inline: false,
                        }
                    );
                    remaining = remaining.substring(1024);
                    addedChars += 1024;
                    if (addedChars > (1024 * 4)) {
                        myEmbed.fields.push(
                            {
                                name: "\u2800",
                                value: `(...) omitted the rest of the output, exceeded ${1024 * 4} characters`,
                                inline: false,
                            }
                        );
                        break;
                    }
                } else {
                    myEmbed.fields.push(
                        {
                            name: "\u2800",
                            value: `${remaining}`,
                            inline: false,
                        }
                    );
                    break;
                }
            }
            message.channel.send({ embeds: [myEmbed] })
                .catch(console.error);
        });


    }
    /**
    * @param {*} musicData
    * @param {*} interaction 
    * @param {*} client 
    * 
    * @returns void
    */
    slashExe(musicData, interaction, client) { }
}


module.exports = { command }
