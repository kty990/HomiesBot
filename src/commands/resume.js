const embed = require('../homiesEmbed.js');


class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "resume";
        this.description = "In development";
        this.options = [];
        this.aliases = ["res", "r"];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(musicData, message, client, args) {
        let voice = musicData['voice'];
        let subscription = musicData['subscription'];

        const guild = message.guild;
        const channel = message.channel;

        subscription.ResumeTrack();

        channel.send({
            content: `**Resuming** ⏯️`,
        })
            .catch(console.error);
        return {
            "subscription": subscription,
            "voice": voice,
        }
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns void
     */
    slashExe(musicData, interaction, client) {
        return new Promise((resolve, reject) => {
            let voice = musicData['voice'];
            let subscription = musicData['subscription'];

            const guild = message.guild;
            const channel = message.channel;

            subscription.ResumeTrack();

            channel.send({
                content: `**Resuming** ⏯️`,
            })
                .catch(console.error);
            resolve({
                "subscription": subscription,
                "voice": voice,
            });
        })
    }
}



module.exports = { command }
