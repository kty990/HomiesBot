const embed = require('../homiesEmbed.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { Track, Subscription } = require('../music/musicHandler');

class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "join";
        this.description = "Joins a voice channel, unless the bot is already connected to a voice channel.";
        this.options = [];
        this.aliases = ["enter", "fuckon", "waxon", "appear"];
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

        const member = message.member;
        if (member === undefined || member === null) {
            throw new Error("Unable to run command with null member.");
        }
        const memberVoice = member.voice;
        const vc = memberVoice.channel;
        const guild = message.guild;
        const channel = message.channel;

        let d = new Date();

        if (vc !== null && vc !== undefined) {
            if (voice !== null && voice !== undefined) {
                console.log(voice.joinConfig.channelId, vc.id);
                if (voice.joinConfig.channelId !== vc.id) {
                    throw new Error("Already in a voice channel. Make me leave that channel before I can join a new one.");
                }
            }

            if ((voice === null || voice === undefined) || (subscription === null || subscription === undefined)) {
                voice = joinVoiceChannel({
                    channelId: vc.id,
                    guildId: guild.id,
                    selfDeaf: true,
                    adapterCreator: guild.voiceAdapterCreator,
                });
                embed(client, embed => {
                    embed.description = `Joined and bound to ${vc}`;
                    channel.send({
                        embeds: [embed],
                    })
                        .catch(console.error);
                });
                subscription = new Subscription(client, message, voice, vc, (track) => {
                    embed(client, embed => {
                        embed.title = "Now playing";
                        embed.fields.push({
                            name: "\u2800",
                            value: `[${track.title}](${track.url})`,
                            inline: false,
                        });
                        channel.send({
                            embeds: [embed]
                        }, d.toISOString())
                            .catch(console.error);
                    })
                }, (track) => {
                    embed(client, embed => {
                        embed.title = "Added to Queue";
                        embed.fields.push({
                            name: "\u2800",
                            value: `[${track.title}](${track.url})`,
                            inline: false,
                        });
                        channel.send({
                            embeds: [embed]
                        }, d.toISOString())
                            .catch(console.error);
                    })
                });
            }
        } else if (vc === null) {
            throw new Error("Unable to join **null** voice channel.");
        }
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
