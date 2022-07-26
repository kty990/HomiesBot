/*
This command is not complete and will not work for anyone aside from developers (currently only kty990 A.K.A. phxntxsmic#2022)
*/

const embed = require('../homiesEmbed.js');

class Card {

    /**
     * 
     * @param {string} type 
     * @param {string | null} color 
     * @param {string} txt 
     */
    constructor(type, color, txt) {
        this.type = type;
        this.color = color;
        this.txt = txt;
    }
}

class Hand {

    constructor(cardArr) {
        this.cards = cardArr;
        this.prototype.toString = function () {
            let display = "";
            for (let x = 0; x < this.cards.length; x++) {
                display = display + `${toString(this.cards[x])}, `
            }
            display = display.substring(0, display.length - 2);
        }
    }
}

class Player {

    constructor(message, member, hand) {
        this.channel = message.channel;
        this.member = member;
        this.hand = hand;
        this.clientGuild = message.guild;
        this.client = message.client;
    }

    setHand(hand) {
        this.hand = hand;
    }

    showHand(isPrivate) {
        if (isPrivate) {
            embed(this.client, embed => {
                embed.title = `Your UNO hand`;
                embed.description = `${toString(this.hand)}`;
                embed.footer.text = `${this.clientGuild?.name}`;
                this.member.send({
                    embeds: [embed],
                })
                    .catch(console.error);
            });
        } else {
            embed(this.client, embed => {
                embed.title = `${this.member}'s hand`;
                embed.description = `${toString(this.hand)}`;
                this.channel.send({
                    embeds: [embed],
                })
                    .catch(console.error);
            });
        }
    }

}

class Deck {

    constructor() {
        this.cards = [];
        this.fillDeck();
    }

    /**
     * @returns Card
     */
    draw() {
        if (this.cards.length > 0) {
            return this.cards.pop();
        } else {
            this.fillDeck();
        }
    }

    /**
     * @returns void
     */
    fillDeck() {
        for ([key, value] of Object.entries(default_cards)) {
            if (value === 7 || value === 6 || key === "+2") {
                // It is a number card
                let colors = [
                    "red",
                    "blue",
                    "green",
                    "yellow"
                ];
                for (let y = 0; y < colors.length; y++) {
                    for (let x = 0; x < value; x++) {
                        this.cards.push(new Card("TYPE", colors[y], key));
                    }
                }
            } else {
                for (let x = 0; x < value; x++) {
                    this.cards.push(new Card("TYPE", null, key));
                }
            }
        }
    }
}

const default_cards = {
    "+4": 4,
    "+2": 4, // per color
    "0": 7, // per color
    "1": 7, // per color
    "2": 7, // per color
    "3": 7, // per color
    "4": 7, // per color
    "5": 7, // per color
    "6": 7, // per color
    "7": 7, // per color
    "8": 7, // per color
    "9": 7, // per color

    "<:reverse_red:1001237103859998871>": 5, // red reverse
    "<:reverse_yellow:1001237088085233754>": 5, // yellow reverse
    "<:reverse_blue:1001237071731642368>": 5, // blue reverse
    "<:reverse_green:1001237116665221261>": 5, // green reverse

    "<:skipturn_red:1001238377863073952>": 5, // red skip turn
    "<:skipturn_blue:1001238379981176963>": 5, // blue skip turn
    "<:skipturn_yellow:1001238376009175151>": 5, // yellow skip turn
    "<:skipturn_green:1001238374335651902> ": 5, // green skip turn

    "<:change_color:1001244981824065606>": 6, // change color emoji needed
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false; // change this to true when the command is completed

        this.started = false;
        this.inProgress = false;
        this.currentPlayers = [];

        this.name = "uno";
        this.description = "In development";
        this.options = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    exe(message, client, ...args) {
        /**
         * Stil need to get unreaction, and create game code
         */

        if (message.author.tag != "phxntxsmic#2022") {
            embed(client, embed => {
                embed.description = "Command under development.";
                message.channel.send({
                    embeds: [embed],
                })
                    .catch(console.error);
            })
            return;
        }
        if (this.started) {
            throw new Error("A game is already started. Please wait for that game to finish before trying to start a new one.");
        }

        this.started = true;
        this.currentPlayers = [message.member];

        embed(client, embed => {
            embed.title = "Welcome to the Homies Bot UNO game!";
            embed.description = `To join the game, please react to this message. Unreacting will withdraw you from the game.\n\`Current players: ${this.currentPlayers.length}/7\``;
            message.channel.send({
                embeds: [embed],
            })
                .then(async msg => {
                    const f = (reaction, user) => reaction.emoji.name == "change_color";// && user.id !== this.currentPlayers[0]; // change color reaction
                    let emoji = await message.guild.emojis.fetch('1001244981824065606');
                    console.log(`Emoji ID: ${emoji.name}, typeof: ${typeof emoji.name}`);
                    msg.react(emoji)
                        .catch(e => {
                            throw new Error(e);
                        })
                    let reactionCollector = msg.createReactionCollector({ filter: f, time: 30_000 });
                    reactionCollector.on('collect', r => {
                        console.log(`collect called for ${r.emoji.name}`);
                        return;
                        if (!this.inProgress) {
                            this.guildInfo.Guild.members.fetch(user).then(member => {
                                this.currentPlayers.push(member);
                                if (this.currentPlayers.length === 7) {
                                    this.inProgress = true;
                                    /**
                                     * GAME CODE
                                     */
                                }
                            })
                                .catch(e => {
                                    throw new Error(e);
                                })
                        }

                    });
                    reactionCollector.on('remove', (reaction, user) => {
                        console.log(`remove called for ${user.tag}`);
                        if (!this.inProgress) {
                            for (let x = 0; x < this.currentPlayers.length; x++) {
                                let member = this.currentPlayers[x];
                                if (member.id === user.id) {
                                    let member = this.currentPlayers.splice(x, 1)[0];
                                    console.log(`${member.user.tag} unreacted to uno prompt`);
                                }
                            }
                        }
                    });
                    reactionCollector.on('end', collection => {
                        if (!this.inProgress) {
                            this.inProgress = true;
                            console.log("ENDED");
                            /**
                             * GAME CODE
                             */
                        }
                        reactionCollector = null;
                    });
                })
                .catch(e => {
                    throw new Error(e);
                });
        });
        /**
         * Get players that want to play (use a reaction tracker, limit of 1 tracker OR active game per guild): if a game is active, a new tracker can NOT be started
         */
        embed(client, embed => {
            embed.description = "Command under development.";
            message.channel.send({
                embeds: [embed],
            })
                .catch(console.error);
        })
        return;
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
