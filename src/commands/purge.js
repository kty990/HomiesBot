function isInt(value) {
    try {
        let v = parseInt(value);
        if (v == value) {
            return true;
        } else {
            return false;
        }
    } catch (e) { }
    return false;
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "purge";
        this.description = "In Development";
        this.options = [];
        this.aliases = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {int | null} limit 
    */
    async exe(message, client, Lmt) {
        let lim = undefined;
        if (isInt(Lmt)) {
            lim = parseInt(Lmt);
            lim = Math.min(lim, 100);
            lim = Math.max(lim, 1);
        }
        let messages = message.channel.messages.cache;
        if (messages.size < lim) {
            messages = await message.channel.messages.fetch({ limit: (lim || 100), cache: true }); // 100 is DiscordAPI set max
        }

        if (messages === undefined || messages === null) {
            throw new Error("Unable to delete messages from this channel.");
        }
        for (let [ID, msg] of messages.entries()) {
            msg.delete()
                .catch(console.error);
        }
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
