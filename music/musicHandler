// ** Dependancies **

const { getInfo } = require('ytdl-core');
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { GuildMember } = require('discord.js');

/**
 * A Track stores all of the music data for each song requested through the 'play' command.
 */
class Track {
    /**
     * 
     * @param {string} url 
     * @param {GuildMember} requester 
     * @param {*} info 
     */
    constructor(url, requester, info) {
        this.url = url;
        this.requester = requester;
        this.info = info;
        this.title = info.videoDetails.title;
        this.duration = info.videoDetails.lengthSeconds;

        // Thumbnail
        var thumbnails = info.videoDetails.thumbnails;
        var thumbnail = thumbnails[0];
        for (x = 0; x < thumbnails.length; x++) {
            if (thumbnails[x].width >= thumbnail.width) {
                thumbnail = thumbnails[x];
            }
        }
        this.thumbnail = thumbnail;
    }

    /**
     * This method attempts to create a <Readable> object of audio for discordjs.AudioPlayer to play.
     * 
     * @returns Promise<AudioResource>
     */
    createAudioResource() {
        return new Promise((resolve, reject) => {
            const stream = ytdl(this.url, { filter: 'audioonly' });
            if (stream) resolve(createAudioResource(stream));
            else reject(new Error("Unable to load stream data."));
        })
    }

    /**
     * 
     * @param {string} url 
     * @param {GuildMember} requester 
     * @returns 
     */
    async from(url, requester) {
        const info = await getInfo(url);
        return new Track(url, requester, info);
    }
}

/**
 * A subscription is used for each VoiceConnection that the bot plays music for.
 */
class Subscription {
    constructor(voiceConnection) {
        if (voiceConnection === null || voiceConnection === undefined) {
            throw new Error("Unable to initialize Subscription for null or undefined connection.");
        }
        this.voiceConnection = voiceConnection;
        this.readyLock = false;
        this.queueLock = false;
        this.queue = [];
        this.currentTrack = null;
        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle) {
                this.processQueue();
            }
        });
    }

    /**
     * 
     * @param {Track} track 
     */
    enqueue(track) {
        this.queue.push(track);
        this.processQueue();
    }

    stop() {
        this.queueLock = true;
        this.queue = [];
        this.currentTrack = null;
        this.audioPlayer.stop(true);
    }

    /**
     * This method attempts to play an item from the queue
     * 
     * @returns Success: Boolean
     */
    async processQueue() {
        // If the queue is locked (already being processed), is empty, or the audio player is already playing something, return
        if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) {
            return;
        }
        // Lock the queue to guarantee safe access
        this.queueLock = true;

        // Take the first item from the queue. This is guaranteed to exist due to the non-empty check above.
        this.currentTrack = this.queue.shift();
        try {
            // Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
            const resource = await this.currentTrack.createAudioResource();
            this.audioPlayer.play(resource);
            this.queueLock = false;
        } catch (error) {
            // If an error occurred, try the next item of the queue instead
            this.queueLock = false;
            return this.processQueue();
        }
    }
}

module.exports = { Track, Subscription };
