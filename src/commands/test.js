const embed = require('../../homiesEmbed.js');

const vm = require('vm');

class whitelist {
    constructor() {
        // Stored using the user's ID.
        this.allowed = [
            "177486429780312064"
        ];
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
        const content = message.content;
        /**
         * TODO:
         * Do check in content for illegal/unaccepted code
         * Run code -> Provide truncated (if necessary) output to user
         * 
         * Input types for code:
         *      - message.content
         *      - message attachments if filetype in [.txt]
         */

        throw new Error("UnimplementedCommandError: test.js");
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