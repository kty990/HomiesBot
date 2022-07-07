const embed = require('../homiesEmbed.js');


class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "leave";
        this.description = "Leaves a voice channel if the user is in a voice channel with the bot.";
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

        if (voice !== null && voice !== undefined) {
            voice.disconnect();
            voice.destroy();
            subscription.destroy();
        }

        embed(client, embed => {
            embed.description = `Okay, goodbye!`;
            embed.footer.text = `Use ${this.guildInfo.Get('prefix')}join and I will join back`;
            channel.send({
                embeds: [embed],
            })
                .catch(console.error);
        })

        return {
            "subscription": null,
            "voice": null,
        }
    }
}



module.exports = { command }