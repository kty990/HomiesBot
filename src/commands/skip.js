const embed = require('../homiesEmbed.js');


class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "skip";
        this.description = "Skips the current song track.";
        // this.options = [
        //     {
        //         name: "url",
        //         description: "A link to a public or unlisted YouTube video",
        //         required: false,
        //         type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        //     }
        // ];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    exe(musicData, message, client, args) {
        let voice = musicData['voice'];
        let subscription = musicData['subscription'];

        const guild = message.guild;
        const channel = message.channel;

        subscription.SkipTrack();

        channel.send({
            content: `**Skipped** ⏩`,
        })
            .catch(console.error);
    }
}



module.exports = { command }