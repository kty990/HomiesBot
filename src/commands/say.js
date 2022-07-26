const Discord = require('discord.js');

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "say";
        this.description = "Echos the provided message";
        // this.options = [
        //     {
        //         name: "message",
        //         description: "The message the bot should echo.",
        //         required: true,
        //         type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        //     }
        // ];
    }

    /**
     * 
     * @param {*} message 
     * @param {*} client *unused*
     * @param {string} args 
     */
    exe(message, client, ...args) {
        let d = new Date();
        const channel = message.channel;
        channel.send({
            content: `${args.join(" ")}`
        })
            .then(msg => {
                if (msg.channel.type === Discord.ChannelType.GuildNews) {
                    msg.crosspost()
                        .catch(console.error);
                } else {
                    console.log(msg.channel);
                }
            })
            .catch(console.error)
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns void
     */
    slashExe(interaction, client) {
        return new Promise((resolve, reject) => {
            const { options } = interaction;
            let message = options.getString("message", true);
            resolve(`${message}`);
        })
    }
}



module.exports = { command }
