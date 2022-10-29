const embed = require('../homiesEmbed.js');
const Discord = require('discord.js');

/**
 * 
 * @param {number} duration Seconds
 */
function DisplayDuration(duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = duration - (minutes * 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - (hours * 60);

    if (hours > 0) {
        return `${hours}h:${minutes}m:${(seconds < 10) ? `0${seconds}` : seconds}s`;
    } else {
        return `${minutes}m:${(seconds < 10) ? `0${seconds}` : seconds}s`;
    }
}

class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "queue";
        this.description = "Shows the song queue for the current server.";
        this.options = [];
        this.aliases = ['q'];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(musicData, message, client, ...args) {
        let voice = musicData['voice'];
        let subscription = musicData['subscription'];

        const guild = message.guild;
        const channel = message.channel;

        let DisplayQueue = "";

        let page;

        try {
            page = parseInt(args);
            if (isNaN(page)) page = 1;
        } catch (e) {
            page = 1;
        }

        let playing = null;
        let totalDuration = 0;
        let queue, data;
        if (subscription !== null && subscription !== undefined) {
            data = subscription.GetQueue();
            queue = data['queue'];
            playing = data['playing'];

            for (let i = (page - 1) * 6; i < queue.length; i++) {
                if (i === page * 6) break;
                let track = queue[i];
                DisplayQueue = DisplayQueue + `${i + 1}: [${(track.title.length <= 50) ? track.title : track.title.substring(0, 49).replace("[", "").replace("]", "")}](${track.url}) (${DisplayDuration(track.duration)}) : ${track.requester}\n`;
            }

            for (let x = 0; x < queue.length; x++) {
                let track = queue[x];
                totalDuration = totalDuration + parseInt(track.duration);
            }
        }

        if (DisplayQueue.length <= 1) {
            DisplayQueue = "[empty]";
        }




        embed(client, embed => {
            if (playing !== null) {
                embed.description = `**Playing now**\n[${(playing.title.length <= 50) ? playing.title.replace("[", "").replace("]", "") : playing.title.substring(0, 49).replace("[", "").replace("]", "")}](${playing.url}) (${DisplayDuration(playing.duration)}) : ${playing.requester}`;
            } else {
                embed.description = "**Playing now**\n[empty]";
            }
            embed.fields.push({
                name: `Page ${page}`,
                value: DisplayQueue,
                inline: false,
            });
            embed.fields.push({
                name: "\u2800",
                value: `\`Queue duration: ${DisplayDuration(totalDuration)}\`\nQueue length: ${queue?.length || 0}`,
                inline: false
            });
            embed.title = `${guild.name} Queue`;
            embed.footer.text = `Use ${this.guildInfo.Get('prefix')}queue [page] to view other pages of the queue`;
            channel.send({
                embeds: [embed],
            })
                .catch(e => {
                    throw new Error(e);
                });
        });
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

            const guild = interaction.guild;
            const channel = interaction.channel;

            let DisplayQueue = "";

            const { options } = interaction;
            let page = options.getInteger("page", false);
            if (page === null || page === undefined) {
                page = 1;
            }
            if (page <= 0) page = 1;

            let playing = null;
            if (subscription !== null && subscription !== undefined) {
                let data = subscription.GetQueue();
                let queue = data['queue'];
                playing = data['playing'];

                for (let i = (page - 1) * 5; i < queue.length; i++) { //10 changed to 5
                    if (i === page * 5) break; //10 changed to 5
                    let track = queue[i];
                    DisplayQueue = DisplayQueue + `${i + 1}: [${(track.title.length <= 20) ? track.title : track.title.substring(0, 19)}](${track.url}) (${DisplayDuration(track.duration)}) : ${track.requester}`;
                }
            }

            if (DisplayQueue.length <= 1) {
                DisplayQueue = "[empty]";
            }

            embed(client, embed => {
                if (playing !== null) {
                    embed.description = `**Playing now**\n[${playing.title}](${playing.url}) (${DisplayDuration(playing.duration)}) : ${playing.requester}`;
                } else {
                    embed.description = "**Playing now**\n[empty]";
                }
                embed.fields.push({
                    name: `Page ${page}`,
                    value: DisplayQueue,
                    inline: false,
                });
                embed.title = `${guild.name} Queue`;
                embed.footer.text = `Use ${this.guildInfo.Get('prefix')}queue [page] to view other pages of the queue`;
                channel.send({
                    embeds: [embed],
                })
                    .catch(e => {
                        reject(e);
                    });
            });
        })
    }
}



module.exports = { command }
