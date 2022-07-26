const embed = require('../homiesEmbed.js');
const { Track, Subscription } = require('../music/musicHandler');

const axios = require('axios');
const { getInfo } = require('ytdl-core');
const Discord = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

function isURL(str) {
    try {
        var value = str.search("https://www.youtube.com/");
        if (value == -1) value = str.search("http://youtu.be");
        if (value == -1) value = str.search("https://youtu.be");
        if (value == -1) value = str.search("http://www.youtube.com/");
        if (value == -1) {
            return false;
        }
        return true;
    } catch (err) {
        console.log(`Error processing isURL(${str}) : ${err}`);
        return false;
    }
}

async function GenerateURL(query) {
    console.log("GenerateURL called.")
    // regex: (?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})
    const videoRegex = "(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\\-_]+)\&?";
    if (query.match(videoRegex)) {
        console.log("Returning url");
        return query;
    } else if (query.includes("playlist") && isURL(query)) { // change to regex
        console.log("playlist");
        // Generate a valid URL
        // var localQuery = query.split(" ").join("+");
        // const queryURL = `https://www.youtube.com/results?search_query=${localQuery}`;

        const queryURL = query; // playlist URL

        let data = [];
        let finished = false;
        axios.get(queryURL).then(res => {
            let body = res.data;
            let firstVideoIndex = body.toLowerCase().indexOf('watch?v=');
            try {
                while (firstVideoIndex !== -1) {
                    const videoId = body.substr(firstVideoIndex, firstVideoIndex + 19);
                    const link = `https://www.youtube.com/${videoId.split('"')[0].split("\\u0026")[0]}`;
                    console.log(`Link: ${link}`);
                    if (!data.includes(link)) {
                        data.push(link);
                    }
                    firstVideoIndex = body.toLowerCase().indexOf('watch?v=', firstVideoIndex + 1);
                    console.log(`Attempting to get next video with firstVideoIndex: ${firstVideoIndex}`);

                }
                finished = true;
            } catch (e) {
                console.error(e);
            }
        })
            .catch(e => {
                throw new Error(e);
            })

        while (!finished) {
            await new Promise(r => setTimeout(r, 500)).catch(console.error);
        }

        console.log(`Returning: ${data || null}`)
        return data || null;
    } else {
        console.log("query");
        // Generate a valid URL
        var localQuery = query.split(" ").join("+");
        const queryURL = `https://www.youtube.com/results?search_query=${localQuery}`;

        let data = null;

        axios.get(queryURL).then(res => {
            let body = res.data;
            try {
                let firstVideoIndex = body.toLowerCase().indexOf('watch?v=');
                const videoId = body.substr(firstVideoIndex, firstVideoIndex + 19);
                const link = `https://www.youtube.com/${videoId.split('"')[0].split("\\u0026")[0]}`;
                console.log(`Link: ${link}`);
                data = link;
            } catch (e) {
                console.error(e);
            }
        })
            .catch(e => {
                throw new Error(e);
            })

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
async function DisplayDuration(duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = duration - (minutes * 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - (hours * 60);

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
        // this.options = [
        //     {
        //         name: "url",
        //         description: "A link to a public or unlisted YouTube video",
        //         required: false,
        //         type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        //     },
        //     {
        //         name: "query",
        //         description: "Search terms for a YouTube video",
        //         required: false,
        //         type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        //     }
        // ];
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
                subscription = new Subscription(client, message, voice, vc, null, null); // both callbacks are set in a few lines
            }
        } else {
            throw new Error(`Unable to join **null** voice channel`);
        }

        subscription.SetOnPlay((track) => {
            embed(client, async embed => {
                embed.title = "Now playing";
                let duration = await DisplayDuration(track.duration);
                embed.description = `[${track.title}](${track.url})\n\`Requested by: ${track.requester.user.tag || 'Unknown'}\`\n\`Duration: ${duration}\``;
                embed.footer.text = `Playing`;
                channel.send({
                    embeds: [embed]
                }, d.toISOString())
                    .catch(console.error);
            })
        });

        subscription.SetOnAdd((track) => {
            if (!track) {
                console.log("No track provided for subscription.OnAdd().. from play.js");
                return;
            }
            embed(client, async embed => {
                embed.title = "Added to Queue";
                let duration = await DisplayDuration(track.duration);
                embed.description = `[${track.title}](${track.url})\n\`Requested by: ${track.requester.user.tag || 'Unknown'}\`\n\`Duration: ${duration}\``;
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
            .then(async (url) => {
                console.log(`URL: ${url}`);
                if (typeof url === 'string') {
                    // Single video
                    getInfo(url)
                        .then(info => {
                            let track = new Track(url, member, info);
                            subscription.enqueue(track);
                        })
                        .catch(console.error);
                } else if (url !== null) {
                    // Playlist
                    console.log("Attempting to enqueue playlist...");
                    let result = await subscription.playlistEnqueue(message, url)
                        .catch(console.error);
                    let duration = 0;
                    if (result) {
                        duration = result['duration'];
                    }
                    try {
                        embed(client, async embed => {
                            embed.title = "Playlist Added to Queue";
                            let dur = await DisplayDuration(duration)
                                .catch(console.error);
                            console.log(`\n\nDuration: ${dur}\t${duration}`);
                            embed.description = `${args.join(' ')}\n\`Requested by: ${member.user.tag || 'Unknown'}\`\n\`Duration: ${dur}\``;
                            embed.footer.text = `Use ${this.guildInfo.Get('prefix')}queue to view the queue`;
                            channel.send({
                                embeds: [embed]
                            }, d.toISOString())
                                .catch(console.error);
                        })
                    } catch (err) {
                        throw new Error(err);
                    }
                } else {
                    console.error(`Unable to generate url for ${args.join(' ')}`);
                }
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
    slashExe(musicData, interaction, client) { }
}



module.exports = { command }
