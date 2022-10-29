const embed = require('../homiesEmbed.js');


class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "password";
        this.description = "DMs a randomly generated password.";
        this.options = [];
        this.aliases = ["pw"];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client, ...args) {
        const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '!', '@', '#', '$', '%', '^', '&', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
        ];
        let data = "";
        let length = 10;
        if (args) {
            if (args.length >= 1) {
                length = parseInt(args[0]);
                if (length === NaN) {
                    throw new Error(`Invalid length. Requires type \`int\`, got \`${typeof args[0]}\``);
                }
            }
        }

        if (length > 900) {
            throw new Error(`Invalid length. Maximum length allowed is 900`);
        }

        for (let x = 0; x < length; x++) {
            let index = Math.floor(Math.random() * chars.length);
            data = data + chars[index];
        }

        embed(client, embed => {
            embed.title = "Password";
            embed.description = `Randomly generated password: \n\`\`\`\n${data}\n\`\`\`\nLength of password: \n\`\`\`\n${length}\n\`\`\``;
            embed.footer.text = `${this.guildInfo.Get("prefix")}password used in ${this.guildInfo.Guild || "unknown server"}`;
            message.author.send({
                embeds: [embed],
            })
                .catch(e => {
                    throw new Error(e);
                });
        })
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns void
     */
    slashExe(musicData, interaction, client) { }
}



module.exports = { command }
