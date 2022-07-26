const embed = require('../homiesEmbed.js');

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
        return `${hours}:${minutes}:${(Math.round(seconds) < 10) ? `0${Math.round(seconds)}` : Math.round(seconds)}`;
    } else {
        return `${minutes}:${(Math.round(seconds) < 10) ? `0${Math.round(seconds)}` : Math.round(seconds)}`;
    }
}

class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "nowplaying";
        this.description = "Shows information on the currently playing song.";
        this.options = [];
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

        if (voice === null || voice === undefined) {
            embed(client, embed => {
                embed.title = "Now Playing"
                embed.description = "[empty]";
                embed.footer.text = `Used by ${message.author.tag}`;
                channel.send({
                    embeds: [embed],
                })
                    .catch(e => {
                        throw new Error(e);
                    })
            })
            return;
        }

        let data = subscription.GetQueue();
        let playing = data['playing'];

        let dot = '🔘';
        let dash = '▬';

        let dotAndDash = "";

        let left = 30 - Math.ceil(playing.timer.left / playing.duration * 30);
        let right = 30 - left;

        for (let x = 0; x < left; x++) {
            dotAndDash = dotAndDash + dash;
        }
        dotAndDash = dotAndDash + dot;
        for (let x = 0; x < right; x++) {
            dotAndDash = dotAndDash + dash;
        }

        embed(client, embed => {
            embed.title = "Now Playing"
            embed.description = `[${playing.title}](${playing.url})\nRequested by: ${playing.requester || 'Unknown'}`;
            embed.fields.push({
                name: "\u2800",
                value: `\`${dotAndDash}\`\n\`Duration: ${DisplayDuration(playing.duration - playing.timer.left)}/${DisplayDuration(playing.duration)}\``,
                inline: false,
            });
            embed.footer.text = `Used by ${message.author.tag}`;
            channel.send({
                embeds: [embed],
            })
                .catch(e => {
                    throw new Error(e);
                })
        })

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
    slashExe(musicData, interaction, client) { }
}



module.exports = { command }
