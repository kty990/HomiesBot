const embed = require('../homiesEmbed.js');
const { Track, Subscription } = require('../music/musicHandler');

const request = require('request');
const { getInfo } = require('ytdl-core');
const Discord = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

async function GenerateURL(query) {
    // regex: (?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})
    const regex = "(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\\-_]+)\&?";
    if (query.match(regex)) {
        return query;
    } else {
        // Generate a valid URL

        var localQuery = query.split(" ").join("+");
        const queryURL = `https://www.youtube.com/results?search_query=${localQuery}`;

        let data = null;
        request(queryURL, (error, response, body) => {
            if (error != null && error != false) {
                throw new Error(`Unable to fetch URL from query: ${error}`);
            }
            var firstVideoIndex = body.toLowerCase().indexOf('watch?v=');
            const videoId = body.substr(firstVideoIndex, firstVideoIndex + 19);
            const link = `https://www.youtube.com/${videoId.split('"')[0].split("\\u0026")[0]}`;
            console.log(`Link: ${link}`);
            data = link;
        });

        while (!data) {
            await new Promise(r => setTimeout(r, 500)).catch(console.error);
        }

        console.log(`Returning: ${data || null}`)
        return data || null;
    }
}

/**
 * 
 * @param {number} duration Seconds
 */
function DisplayDuration(duration) {
    let hours = 0;
    let minutes = 0;
    let seconds = duration;
    while (seconds >= 60) {
        seconds = seconds - 60;
        minutes++;
    }
    while (minutes >= 60) {
        minutes = minutes - 60;
        hours++;
    }
    if (hours > 0) {
        return `${hours}h:${minutes}m:${(Math.round(seconds) < 10) ? `0${Math.round(seconds)}s` : Math.round(seconds)}s`;
    } else {
        return `${minutes}m:${(Math.round(seconds) < 10) ? `0${Math.round(seconds)}s` : Math.round(seconds)}s`;
    }
}

class command {
    constructor(guildInfo) {
        this.isMusic = true;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "play";
        this.description = "Plays a YouTube video using a URL or search query.";
        this.options = [
            {
                name: "url",
                description: "A link to a public or unlisted YouTube video",
                required: false,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            },
            {
                name: "query",
                description: "Search terms for a YouTube video",
                required: false,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            }
        ];
    }

    /**
     * @param {Object} musicData
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {Array} args 
    */
    async exe(musicData, message, client, ...args) {
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
                subscription = new Subscription(message, voice, vc, (track) => {
                    embed(client, embed => {
                        embed.title = "Now playing";
                        embed.fields.push({
                            name: "\u2800",
                            value: `[${track.title}](${track.url})\n\`Requested by: ${track.requester || 'Unknown'}\`\n\`Duration: ${DisplayDuration(track.duration)}\``,
                            inline: false,
                        });
                        embed.footer.text = `Playing`;
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
                            value: `[${track.title}](${track.url})\n\`Requested by: ${track.requester || 'Unknown'}\`\n\`Duration: ${DisplayDuration(track.duration)}\``,
                            inline: false,
                        });
                        embed.footer.text = `Use ${this.guildInfo.Get('prefix')}queue to view the queue`;
                        channel.send({
                            embeds: [embed]
                        }, d.toISOString())
                            .catch(console.error);
                    })
                });
            }
        } else {
            throw new Error(`Unable to join **null** voice channel`);
        }

        subscription.SetOnPlay((track) => {
            embed(client, embed => {
                embed.title = "Now playing";
                embed.fields.push({
                    name: "\u2800",
                    value: `[${track.title}](${track.url})\n\`Requested by: ${track.requester || 'Unknown'}\`\n\`Duration: ${DisplayDuration(track.duration)}\``,
                    inline: false,
                });
                embed.footer.text = `Playing`;
                channel.send({
                    embeds: [embed]
                }, d.toISOString())
                    .catch(console.error);
            })
        });

        subscription.SetOnAdd((track) => {
            embed(client, embed => {
                embed.title = "Added to Queue";
                embed.fields.push({
                    name: "\u2800",
                    value: `[${track.title}](${track.url})\n\`Requested by: ${track.requester || 'Unknown'}\`\n\`Duration: ${DisplayDuration(track.duration)}\``,
                    inline: false,
                });
                embed.footer.text = `Use ${this.guildInfo.Get('prefix')}queue to view the queue`;
                channel.send({
                    embeds: [embed]
                }, d.toISOString())
                    .catch(console.error);
            })
        });

        subscription.SetOnEmpty(() => {
            embed(client, embed => {
                embed.description = `The queue is empty`;
                embed.footer.text = `Use ${this.guildInfo.Get('prefix')}play to add more songs to the queue.`
                channel.send({
                    embeds: [embed]
                }, d.toISOString())
                    .catch(console.error);
            });
        })

        channel.send({
            content: `<:youtube:989094876807315476> **Searching** \`${args.join(' ')}\``,
        })
            .catch(console.error)

        GenerateURL(args.join(' '))
            .then(url => {
                console.log(`URL: ${url}`);
                getInfo(url)
                    .then(info => {
                        let track = new Track(url, member, info);
                        subscription.enqueue(track);
                    })
                    .catch(console.error);
            })
            .catch(console.error);

        return {
            "subscription": subscription,
            "voice": voice,
        }
    }
}



module.exports = { command }