// ** Dependancies **

const { createAudioResource, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { GuildMember } = require('discord.js');
const embed = require('../homiesEmbed');

class Timer {
    constructor(duration) {
        this.duration = duration;
        this.left = duration;
        this.running = false;
    }

    start(duration, iteration) {
        if (this.running && !iteration) {
            console.warn("Can't start if already running...");
            return;
        }
        if (duration !== null && duration !== undefined) {
            this.duration = duration;
            this.left = duration;
        }
        this.running = true;
        setTimeout(() => {
            if (!this.running) {
                console.log("RETURN 1");
                return;
            }
            this.left = this.left - 0.1;
            if (this.left <= 0) {
                this.left = 0;
                this.running = false;
                console.log("RETURN 2");
                return;
            }
            this.start(null, true);
        }, 100)
    }

    stop() {
        this.running = false;
    }

    destroy() {
        this.running = null;
        this.left = null;
        this.duration = null;
    }
}

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
        this.timer = new Timer(0); // will be set on start

        this.info = info;
        this.title = info.videoDetails.title;
        this.duration = info.videoDetails.lengthSeconds;

        // Thumbnail
        var thumbnails = info.videoDetails.thumbnails;
        var thumbnail = thumbnails[0];
        for (var x = 0; x < thumbnails.length; x++) {
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
            if (stream) {
                let result = createAudioResource(stream);
                this.currentResource = result;
                resolve(result);
            }
            else reject(new Error("Unable to load stream data."));
        })
    }
}

/**
 * A subscription is used for each VoiceConnection that the bot plays music for.
 */
class Subscription {


    /*
    Has to be added later:
    
    var countdown = SONG_DURATION;
    
    const interval = setInterval(() => {
    track.timeLeft--;
     if (track.timeLeft < 0 || SONG_IS_PAUSED || SONG_NO_EXISTS) clearInterval(interval);
    }, 1000);
    */


    constructor(message, voiceConnection, voiceChannel, onPlay, onAdd) {
        if (voiceConnection === null || voiceConnection === undefined) {
            throw new Error("Unable to initialize Subscription for null or undefined connection.");
        }
        this.voiceChannel = voiceChannel;
        this.voiceConnection = voiceConnection;
        this.readyLock = false;
        this.queueLock = false;
        this.queue = [];
        this.currentTrack = null;
        this.onPlay = onPlay;
        this.onAdd = onAdd;
        this.audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            }
        });
        this.voiceConnection.subscribe(this.audioPlayer);
        this.audioPlayer.on('stateChange', (oldState, newState) => {
            try {
                if (newState.status === AudioPlayerStatus.Idle) {
                    console.log("Idle has been detected, attempting to restart player using new track");
                    this.processQueue();
                    if (this.currentTrack !== null) {
                        this.currentTrack.timer.stop();
                    }
                } else {
                    if (!this.currentTrack.timer.running) {
                        this.currentTrack.timer.start();
                    }
                    console.error(`State "${newState.status}" has been detected`);
                }
            } catch (e) {
                console.warn(`\n\nAn error occured at stateChange: ${e}\n\n`)
            }
        });

        this.audioPlayer.on('error', error => {
            console.warn(`\n\nAn unhandled audioPlayer error occured: ${error}\n\n`);
            message.channel.send({
                content: `An unhandled audioPlayer error occured: ${error}`
            })
                .catch(console.error);
        });
    }

    /**
     * Adds a track to the queue.
     * 
     * @param {Track} track 
     */
    enqueue(track) {
        this.queue.push(track);
        this.processQueue();
    }

    /**
     * @param {function} onPlay Callback
     * 
     * @returns void
     */
    SetOnPlay(onPlay) {
        this.onPlay = onPlay;
    }

    /**
     * Destroys the subscription.
     */
    destroy() {
        try {
            this.voiceChannel = null;
            this.voiceConnection = null;
            this.readyLock = null;
            this.queueLock = null;
            this.queue = null;
            this.currentTrack = null;
            this.onPlay = null;
            this.onAdd = null;
            this.onEmpty = null;
            this.audioPlayer.removeAllListeners();
            this.audioPlayer = null;
            if (this.currentTrack !== null) {
                if (this.currentTrack.timer != null) {
                    this.currentTrack.timer.destroy();
                    this.currentTrack.timer = null;
                }
            }
        } catch (e) {
            console.error(`Error on Subscription.destroy(): ${e}`);
        }
    }

    /**
     * @param {function} onAdd Callback
     * 
     * @returns void
     */
    SetOnAdd(onAdd) {
        this.onAdd = onAdd;
    }

    /**
     * @param {function} onEmpty Callback
     * 
     * @returns void
     */
    SetOnEmpty(onEmpty) {
        this.onEmpty = onEmpty;
    }

    /**
     * Returns the current queue
     * 
     * @returns queue : Track
     */
    GetQueue() {
        return {
            'playing': this.currentTrack,
            'queue': this.queue
        };
    }

    /**
     * Stops the current track.
     * 
     * @returns void
     */
    Stop() {
        try {
            this.queueLock = true;
            this.queue = [];
            this.currentTrack = null;
            this.audioPlayer.stop(true);
            this.currentTrack.timer.destroy();
        } catch (e) {
            console.error(`Error at Subscription.Stop(): ${e}`);
        }
    }

    /**
     * 
     */
    SkipTrack() {
        this.currentTrack.timer.stop();
        this.processQueue(true);
    }

    /**
     * Not implemented
     */
    PauseTrack() {
        try {
            this.audioPlayer.pause();
            this.currentTrack.timer.stop();
        } catch (e) {
            console.error(`Error at Subscription.PauseTrack(): ${e}`);
        }
    }

    /**
     * Not implemented
     */
    ResumeTrack() {
        try {
            this.audioPlayer.unpause();
            this.currentTrack.timer.start();
        } catch (e) {
            console.error(`Error at Subscription.ResumeTrack(): ${e}`);
        }
    }

    /**
     * This method attempts to play an item from the queue
     * @param {boolean | null} skip 
     * 
     * @returns boolean
     */
    async processQueue(skip) {
        try {
            if ((skip === false || skip === null || skip === undefined) && (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0)) {
                console.debug(`Unable to process queue: \nQueueLock: ${this.queueLock}\nStatus: ${this.audioPlayer.state.status}\nQueue: ${this.queue.length}`);
                if (this.audioPlayer.state.status === AudioPlayerStatus.Playing) {
                    if (this.onAdd) {
                        try { // for debugging purposes
                            this.onAdd(this.queue[this.queue.length - 1]);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                if (this.queue.length === 0 && !this.queueLock && (this.audioPlayer.state.status === AudioPlayerStatus.Idle || this.audioPlayer.state.status === AudioPlayerStatus.AutoPaused)) {
                    if (this.onEmpty) {
                        this.onEmpty();
                    }
                }
                return;
            }
            // Lock the queue to guarantee safe access
            this.queueLock = true;

            // Take the first item from the queue. This is guaranteed to exist due to the non-empty check above.
            this.currentTrack = this.queue.shift();
            try {
                // Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
                const resource = await this.currentTrack.createAudioResource();
                if (this.currentTrack.timer.running) {
                    this.currentTrack.timer.stop();
                    this.currentTrack.timer.destroy();
                    this.currentTrack.timer = null;
                    this.currentTrack.timer = new Timer(this.currentTrack.duration);
                }
                this.currentTrack.timer.start(this.currentTrack.duration);

                this.audioPlayer.play(resource);
                if (this.onPlay) {
                    this.onPlay(this.currentTrack);
                }


                this.queueLock = false;
            } catch (error) {
                // If an error occurred, try the next item of the queue instead
                this.queueLock = false;
                return this.processQueue();
            }
        } catch (e) {
            console.error(`Error at Subscription.processQueue(): ${e}`);
        }
    }
}

module.exports = { Track, Subscription };
