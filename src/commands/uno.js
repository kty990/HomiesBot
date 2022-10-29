const embed = require('../homiesEmbed.js');

const TESTING = true;



/**
* NEXT OBJECTIVE: Re-add yellow number emojis (Had to delete and reupload to new server since nitro subscription is ending)
*/





class Card {

    /**
     * 
     * @param {string} type 
     * @param {string | null} color 
     * @param {string} txt 
     */
    constructor(type, color, txt, default_id, id) {
        this.type = type;
        this.color = color;
        this.txt = txt;
        this.default_id = default_id;
        this.id = id;
    }
}

class Hand {

    constructor(cardArr) {
        this.cards = cardArr;
        console.log(`cardArr: ${typeof cardArr}`);
    }
}

class Player {

    constructor(message, member, hand) {
        this.channel = message.channel;
        this.member = member;
        this.hand = hand;
        if (this.hand === null || this.hand === undefined) {
            this.hand = [];
        }
        this.clientGuild = message.guild;
        this.client = message.client;
        this.handMessagePrivate = null;
        this.handMessagePublic = null;
        this.middleCardPrivate = null;
        this.currentMiddleCard = null;
        this.turnMessage = null;
    }

    setHand(hand) {
        this.hand = hand;
    }

    /**
     * It is working with 1 person
     * @param {Player} player 
     */
    async showTurn(player) {

        if (this.turnMessage) {
            embed(this.client, e => {
                e.description = `It is currently ${player.member.user.tag}'s turn`;
                this.turnMessage.edit({
                    embeds: [e]
                })
                    .catch(console.error);
            })
        } else {
            embed(this.client, async e => {
                e.description = `It is currently ${player.member.user.tag}'s turn`;
                this.turnMessage = await this.member.send({
                    embeds: [e]
                })
                    .catch(console.error);
                console.log(`\n\nShowing turn for ${player}\n\n`);
            })
        }
    }

    /**
     * Reacts to the handMessagePrivate message if available.
     * If not, the promise is rejected.
     * 
     * @returns Promise
     */
    playCard() {
        return new Promise(async (resolve, reject) => {
            if (this.handMessagePrivate === null || this.handMessagePrivate === null) {
                reject(`No private message for hand display found for ${this.member.user.tag}`);
                return;
            }

            /**
             * 
             * 
             * 
             * 
             * THIS HAS TO BE FINISHED:
             *          - Add 'draw card' option
             *          - Alter +4, and changecolor options to include the color to switch to in reactions
             * 
             * 
             * 
             * 
             * 
             * 
             */
            let id_arr = [];
            for (let x = 0; x < this.hand.cards.length; x++) {
                let card = this.hand.cards[x];
                id_arr.push(card.id);
                if (card.default_id === true) {
                    this.handMessagePrivate.react(card.id)
                        .catch(e => {
                            throw new Error(e);
                        })
                } else {
                    let emoji = await this.channel.guild.emojis.fetch(card.id);
                    this.handMessagePrivate.react(emoji)
                        .catch(e => {
                            throw new Error(e);
                        })
                }
            }

            /**
             * Check if the card played is possible to be played..
             * Add reaction for each type of card in hand..
             * Add reaction for drawing a card.. (counts as the player's turn unless the card is playable)
             */
            let f = r => id_arr.includes(r.emoji.id);

            const canBePlayed = (card) => {
                if (card.type === "+4" || card.type === "colorchange") {
                    return true;
                } else {
                    if (card.type === this.currentMiddleCard.type) {
                        return true;
                    }
                    if (card.color === this.currentMiddleCard.color) {
                        return true;
                    }
                }
                return false;
            }

            let reactionCollector = this.handMessagePrivate.createReactionCollector({ filter: f, time: 30_000, dispose: true });
            reactionCollector.on('collect', (reaction, user) => {
                /**
                 * This should not be accessing this.currentPlayers... this.currentPlayers is only in the command class.
                 * 
                 * Instead, access the hand from this class, and the member from this class.
                 */
                if (user === this.client.user) return;

                for (let y = 0; y < player.hand.cards.length; y++) {
                    let card = this.hand.cards[y];
                    if (reaction.emoji.id === card.id) {
                        if (canBePlayed(card)) {
                            if (card.type === "colorchange") {

                                /**
                                 * 
                                 * 
                                 * 
                                 * 
                                 * 
                                 *     THIS HAS TO BE FINISHED:
                                 *          - Check reaction for color to switch to
                                 * 
                                 *      ALSO HAS TO BE DONE FOR +4
                                 * 
                                 * 
                                 * 
                                 * 
                                 * 
                                 *   STEPS:
                                 *      1. Get color of the reaction
                                 *      2. Create new card obj with the correct color
                                 *      3. Remove this card from the player's hand
                                 *      4. Resolve the new card
                                 * 
                                 * 
                                 * 
                                 */
                            }
                            let hand_size = this.hand.cards.length;
                            resolve({
                                card: this.hand.cards.splice(y, 1)[0],
                                size: hand_size,
                            });
                        } else {
                            this.handMessagePrivate.reactions.resolve(reaction).users.remove(user);
                        }
                    }
                }

            });
            reactionCollector.on('remove', (reaction, user) => {
                if (user === this.client.user) {
                    reaction.react()
                        .catch(console.error);
                }
            });
            reactionCollector.on('end', (collection, reason) => {
                resolve(null);
            });
            /**
             * 1. React with each type of card the user has
             * 2. Await a reaction to the message
             * 3. Resolve with card the user plays (remove card from the users hand too)
             */

            // let hand_size = this.hand.cards.length;
            // resolve({
            //     card: null,
            //     size: hand_size,
            // }); // Placeholder
        });
    }

    /**
     * 
     * @param {*} card 
     */
    async showMiddleCard(card) {
        this.currentMiddleCard = card;
        if (this.middleCardPrivate) {
            embed(this.client, embed => {
                embed.title = `Middle card`;
                embed.description = `${card.txt}`;
                embed.footer.text = `${this.clientGuild?.name || ""}`;
                this.middleCardPrivate.edit({
                    embeds: [embed],
                }).then(msg => this.middleCardPrivate = msg)
                    .catch(console.error);
            })
        } else {
            embed(this.client, embed => {
                embed.title = `Middle card`;
                embed.description = `${card.txt}`;
                console.log(`This is the middle card: ${card.txt}`);
                embed.footer.text = `${this.clientGuild?.name || ""}`;
                this.member.send({
                    embeds: [embed],
                }).then(msg => this.middleCardPrivate = msg)
                    .catch(console.error);
                console.log(`\n\nShowing middle card for ${this.member.user.tag}\n\n`);
            })

        }
    }

    /**
     * 
     * @param {*} isPrivate 
     * @returns void
     * 
     * currently not working... shows "[object Undefined]" as description of embed
     */
    showHand(isPrivate) {
        return new Promise((resolve, reject) => {
            if (isPrivate) {
                if (this.handMessagePrivate) {
                    embed(this.client, embed => {
                        embed.title = `Your UNO hand`;
                        let hand = "";
                        for (let x = 0; x < this.hand.cards.length; x++) {
                            hand = hand + `${this.hand.cards[x].txt}   `;
                        }
                        console.log(`${this.member.user.tag}'s hand: ${hand}\tLength: ${this.hand.cards.length}`);
                        embed.description = `${hand}`;
                        embed.footer.text = `${this.clientGuild?.name || ""}`;
                        this.handMessagePrivate.edit({
                            embeds: [embed],
                        }).then(msg => {
                            this.handMessagePrivate = msg;
                            resolve();
                        })
                            .catch(console.error);
                    })

                } else {
                    embed(this.client, embed => {
                        embed.title = `Your UNO hand`;
                        let hand = "";
                        for (let x = 0; x < this.hand.cards.length; x++) {
                            hand = hand + `${this.hand.cards[x].txt}   `;
                        }
                        embed.description = `${hand}`;
                        console.log(`${this.member.user.tag}'s hand: ${hand}\tLength: ${this.hand.cards.length}`);
                        embed.footer.text = `${this.clientGuild?.name || ""}`;
                        this.member.send({
                            embeds: [embed],
                        }).then(msg => {
                            this.handMessagePrivate = msg;
                            resolve();
                        })
                            .catch(console.error);
                        console.log(`\n\nShowing hand for ${this.member.user.tag}\n\n`);
                    })

                }
            } else {
                if (this.handMessagePublic) {
                    embed(this.client, embed => {
                        embed.title = `${this.member}'s hand`;
                        embed.description = `${toString(this.hand)}`;
                        this.handMessagePublic.edit({
                            embeds: [embed],
                        })
                            .then(msg => {
                                this.handMessagePublic = msg;
                                resolve();
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
                            .then(msg => {
                                this.handMessagePublic = msg;
                                resolve();
                            })
                            .catch(console.error);
                    });
                }

            }
        })
    }

}

class Deck {

    constructor() {
        this.cards = [];
        this.fillDeck();
        this.shuffle();
    }

    /**
     * @returns Card
     */
    draw() {
        if (this.cards.length > 0) {
            return this.cards.pop();
        } else {
            this.fillDeck();
            this.shuffle();
            return this.cards.pop();
        }
    }

    /**
     * 
     */
    shuffle() {
        let array = this.cards;
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    /**
     * @returns void
     */
    fillDeck() {
        for (let x = 0; x < default_cards.length; x++) {
            let value = default_cards[x];
            if (value.count === 7) {
                // It is a number card

                for (let y = 0; y < value.count; y++) {
                    //type, color, txt, default_id, id
                    this.cards.push(new Card(value.type, value.color, value.display, value.default_id, value.id));
                }
            } else {
                for (let y = 0; y < value.count; y++) {
                    this.cards.push(new Card(value.type, value.color, value.display, value.default_id, value.id));
                }
            }
        }
    }
}

/**
 * Add emoji IDs for each of these cards
 */
const default_cards = [
    /**
     * Still have to make the emojis for +4 and +2 different colors. +4 emojis go into the special_cards array
     */
    {
        type: "+4",
        display: "<:4:1001659773130911834>",
        color: null, // this card is played, but a new card will replace it when it is played.
        count: 4,
        default_id: false,
        id: "1001659773130911834"
    },
    {
        type: "+2",
        display: "<:2:1001659796660944956>",
        count: 4,
        color: null, // this card is played, but a new card will replace it when it is played.
        default_id: false,
        id: "1001659796660944956"
    },

    //////////////////////////// RED ////////////////////////////

    {
        type: "R0",
        display: "<:red_zero:1008134568768983120>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134568768983120"
    },
    {
        type: "R1",
        display: "<:red_one:1008134562985025669>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134562985025669"
    },
    {
        type: "R2",
        display: "<:red_two:1008134567598751875>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134567598751875"
    },
    {
        type: "R3",
        display: "<:red_three:1008134566394986626> ",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134566394986626"
    },
    {
        type: "R4",
        display: "<:red_four:1008134560954982471> ",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134560954982471"
    },
    {
        type: "R5",
        display: "<:red_five:1008134559507955744>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134559507955744"
    },
    {
        type: "R6",
        display: "<:red_six:1008134565312860201>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134565312860201"
    },
    {
        type: "R7",
        display: "<:red_seven:1008134564243329035>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134564243329035"
    },
    {
        type: "R8",
        display: "<:red_eight:1008134558610362530>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134558610362530"
    },
    {
        type: "R9",
        display: "<:red_nine:1008134562079059998>",
        count: 7,
        color: "red",
        default_id: false,
        id: "1008134562079059998"
    },

    //////////////////////////// YELLOW ////////////////////////////

    {
        type: "Y0",
        display: "<:yellow_zero:1008501164205162586>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501164205162586"
    },
    {
        type: "Y1",
        display: "<:yellow_one:1008501157737541762>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501157737541762"
    },
    {
        type: "Y2",
        display: "<:yellow_two:1008501162967846922>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501162967846922"
    },
    {
        type: "Y3",
        display: "<:yellow_three:1008501161801822218>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501161801822218"
    },
    {
        type: "Y4",
        display: "<:yellow_four:1008501155065761922>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501155065761922"
    },
    {
        type: "Y5",
        display: "<:yellow_five:1008501153543225434>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501153543225434"
    },
    {
        type: "Y6",
        display: "<:yellow_six:1008501160354795610>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501160354795610"
    },
    {
        type: "Y7",
        display: "<:yellow_seven:1008501158974865498>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501158974865498"
    },
    {
        type: "Y8",
        display: "<:yellow_eight:1008501152104599572>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501152104599572"
    },
    {
        type: "Y9",
        display: "<:yellow_nine:1008501156298883112>",
        count: 7,
        color: "yellow",
        default_id: false,
        id: "1008501156298883112"
    },


    //////////////////////////// GREEN ////////////////////////////

    {
        type: "G0",
        display: "<:green_zero:1008501115219882075>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501115219882075"
    },
    {
        type: "G1",
        display: "<:green_one:1008501108777439273>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501108777439273"
    },
    {
        type: "G2",
        display: "<:green_two:1008501113584107611>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501113584107611"
    },
    {
        type: "G3",
        display: "<:green_three:1008501112585855026>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501112585855026"
    },
    {
        type: "G4",
        display: "<:green_four:1008501106386677790>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501106386677790"
    },
    {
        type: "G5",
        display: "<:green_five:1008501105027723294>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501105027723294"
    },
    {
        type: "G6",
        display: "<:green_six:1008501111084306474>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501111084306474"
    },
    {
        type: "G7",
        display: "<:green_seven:1008501110018941018>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501110018941018"
    },
    {
        type: "G8",
        display: "<:green_eight:1008501103454863404>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501103454863404"
    },
    {
        type: "G9",
        display: "<:green_nine:1008501107607208046>",
        count: 7,
        color: "green",
        default_id: false,
        id: "1008501107607208046"
    },


    //////////////////////////// BLUE ////////////////////////////

    {
        type: "B0",
        display: "<:blue_zero:1008501035419050034>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501035419050034"
    },
    {
        type: "B1",
        display: "<:blue_one:1008501028792062012>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501028792062012"
    },
    {
        type: "B2",
        display: "<:blue_two:1008501034299179079>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501034299179079"
    },
    {
        type: "B3",
        display: "<:blue_three:1008501032831176775>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501032831176775"
    },
    {
        type: "B4",
        display: "<:blue_four:1008501026573258772>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501026573258772"
    },
    {
        type: "B5",
        display: "<:blue_five:1008501025122029659>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501025122029659"
    },
    {
        type: "B6",
        display: "<:blue_six:1008501031061164075>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501031061164075"
    },
    {
        type: "B7",
        display: "<:blue_seven:1008501029949677588>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501029949677588"
    },
    {
        type: "B8",
        display: "<:blue_eight:1008501024450949120>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501024450949120"
    },
    {
        type: "B9",
        display: "<:blue_nine:1008501027479224351>",
        count: 7,
        color: "blue",
        default_id: false,
        id: "1008501027479224351"
    },

    /////////////////////////////////////////////////////////////////////////////////////////////

    {
        type: "reverse",
        display: "<:reverse_red:1001237103859998871>",
        count: 5,
        color: "red",
        default_id: false,
        id: "1001237103859998871"
    },
    {
        type: "reverse",
        display: "<:reverse_blue:1001237071731642368>",
        count: 5,
        color: "blue",
        default_id: false,
        id: "1001237071731642368"
    },
    {
        type: "reverse",
        display: "<:reverse_yellow:1001237088085233754>",
        count: 5,
        color: "yellow",
        default_id: false,
        id: "1001237088085233754"
    },
    {
        type: "reverse",
        display: "<:reverse_green:1001237116665221261>",
        count: 5,
        color: "green",
        default_id: false,
        id: "1001237116665221261"
    },
    {
        type: "skip",
        display: "<:skipturn_red:1001238377863073952>",
        count: 5,
        color: "red",
        default_id: false,
        id: "1001238377863073952"
    },
    {
        type: "skip",
        display: "<:skipturn_blue:1001238379981176963>",
        count: 5,
        color: "blue",
        default_id: false,
        id: "1001238379981176963"
    },
    {
        type: "skip",
        display: "<:skipturn_yellow:1001238376009175151>",
        count: 5,
        color: "yellow",
        default_id: false,
        id: "1001238376009175151"
    },
    {
        type: "skip",
        display: "<:skipturn_green:1001238374335651902>",
        count: 5,
        color: "green",
        default_id: false,
        id: "1001238374335651902"
    },
    {
        type: "colorchange",
        display: "<:change_color:1001244981824065606>",
        count: 6,
        color: null, // this card is played, but a new card will replace it when it is played.
        default_id: false,
        id: "1001244981824065606"
    },
]

const special_cards = [
    {
        type: "colorchange",
        display: "<:red_color_change:1008571881672163469>",
        color: "red",
        default_id: false,
        id: "1008571881672163469"
    },
    {
        type: "colorchange",
        display: "<:green_color_change:1008571880313209013>",
        color: "green",
        default_id: false,
        id: "1008571880313209013"
    },
    {
        type: "colorchange",
        display: "<:yellow_color_change:1008571882687168583>",
        color: "yellow",
        default_id: false,
        id: "1008571882687168583"
    },
    {
        type: "colorchange",
        display: "<:blue_color_change:1008571879155580988>",
        color: "blue",
        default_id: false,
        id: "1008571879155580988"
    },
]

const HAND_SIZE = 5;
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 7;

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false; // change this to true when the command is completed

        this.started = false;
        this.inProgress = false;
        this.currentPlayers = [];
        this.playingPlayers = [];
        this.deck = new Deck();

        this.name = "uno";
        this.description = "In development";
        this.options = [];
        this.aliases = [];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client, ...args) {
        /**
         * Stil need to create game code
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

        /**
         * NEXT OBJECTIVE: Convert "run" into recursive function
         */
        let playerIndex = 0;
        this.playingPlayers = [];
        let startingCard = this.deck.draw();
        const run = async (isInitialized) => {
            /**
             * Initialize all players
             */

            if (!isInitialized) {
                for (let x = 0; x < this.currentPlayers.length; x++) {
                    let cards = [];
                    for (let y = 0; y < HAND_SIZE; y++) {
                        cards.push(this.deck.draw());
                    }
                    let hand = new Hand(cards);
                    let player = new Player(message, this.currentPlayers[x], hand);
                    this.playingPlayers.push(player);
                    await player.showTurn(this.playingPlayers[playerIndex]);
                    await player.showMiddleCard(startingCard);
                    await player.showHand(true);
                }
                isInitialized = true;
            }

            // STOPPED HERE

            if (this.inProgress) {
                let player = this.playingPlayers[playerIndex];
                let card_data = await player.playCard().catch(e => {
                    console.error(e);
                    throw new Error(e);
                });
                if (card_data === null) {
                    playerIndex++;
                    if (playerIndex >= this.playingPlayers.length) {
                        playerIndex = 0;
                    }
                    for (let y = 0; y < this.playingPlayers.length; y++) {
                        let player = this.playingPlayers[y];
                        player.showTurn(this.playingPlayers[playerIndex]);
                    }
                    run(isInitialized);
                    return;
                }



                //////////////////////////////////////////////////////
                ////////////// RECURSIVE ATTEMPT /////////////////////
                //////////////////////////////////////////////////////

                player.showHand(true);
                let card = card_data.card;
                let size = card_data.size;
                for (let y = 0; y < this.playingPlayers.length; y++) {
                    this.playingPlayers[y].showMiddleCard(card);
                }
                if (size === 0) {
                    this.inProgress = false;
                    this.started = false;

                    this.playingPlayers.sort((a, b) => {
                        if (a.hand.cards.length > b.hand.cards.length) {
                            return -1;
                        } else if (a.hand.cards.length < b.hand.cards.length) {
                            return 1;
                        }
                        return 0;
                    })

                    let rankResult = "";
                    for (let y = 0; y < this.playingPlayers.length; y++) {
                        rankResult = rankResult + `**${y + 1}.** ${this.playingPlayers[y].member} (${this.playingPlayers[y].hand.cards.length} cards remaining)`;
                    }

                    embed(client, e => {
                        e.title = "Homies Bot UNO game!";
                        e.description = `Congratulations to ${player.member} for winning.`;
                        e.fields.push({
                            name: "Ranking",
                            value: rankResult,
                            inline: false,
                        });
                        message.channel.send({
                            embeds: [e],
                        })
                            .catch(err => {
                                throw new Error(err);
                            })
                    });
                }
                playerIndex++;
                if (playerIndex >= this.playingPlayers.length) {
                    playerIndex = 0;
                }
                for (let y = 0; y < this.playingPlayers.length; y++) {
                    this.playingPlayers[y].showTurn(this.playingPlayers[playerIndex]);
                }
            }





            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            // while (this.inProgress) {
            //     for (let x = 0; x < this.playingPlayers.length; x++) {
            //         let player = this.playingPlayers[x];
            //         let card_data = await player.playCard().catch(e => {
            //             console.error(e);
            //             throw new Error(e);
            //         });
            //         if (card_data === null) {
            //             playerIndex++;
            //             if (playerIndex >= this.currentPlayers.length) {
            //                 playerIndex = 0;
            //             }
            //             for (let y = 0; y < this.currentPlayers.length; y++) {
            //                 let player = this.currentPlayers[y];
            //                 player.showTurn(this.currentPlayers[playerIndex]);
            //             }
            //             continue;
            //         }
            //         player.showHand(true);
            //         let card = card_data.card;
            //         let size = card_data.size;
            //         for (let y = 0; y < this.playingPlayers.length; y++) {
            //             this.playingPlayers[y].showMiddleCard(card);
            //         }
            //         if (size === 0) {
            //             this.inProgress = false;
            //             this.started = false;

            //             this.currentPlayers.sort((a, b) => {
            //                 if (a.hand.cards.length > b.hand.cards.length) {
            //                     return -1;
            //                 } else if (a.hand.cards.length < b.hand.cards.length) {
            //                     return 1;
            //                 }
            //                 return 0;
            //             })

            //             let rankResult = "";
            //             for (let y = 0; y < this.currentPlayers.length; y++) {
            //                 rankResult = rankResult + `**${y + 1}.** ${this.currentPlayers[y].member} (${this.currentPlayers[y].hand.cards.length} cards remaining)`;
            //             }

            //             embed(client, e => {
            //                 e.title = "Homies Bot UNO game!";
            //                 e.description = `Congratulations to ${player.member} for winning.`;
            //                 e.fields.push({
            //                     name: "Ranking",
            //                     value: rankResult,
            //                     inline: false,
            //                 });
            //                 message.channel.send({
            //                     embeds: [e],
            //                 })
            //                     .catch(err => {
            //                         throw new Error(err);
            //                     })
            //             });
            //         }
            //         playerIndex++;
            //         if (playerIndex >= this.currentPlayers.length) {
            //             playerIndex = 0;
            //         }
            //         player.showTurn(this.currentPlayers[playerIndex]);
            //     }
            // }
        }

        embed(client, e => {
            e.title = "Welcome to the Homies Bot UNO game!";
            e.description = `To join the game, please react to this message. Unreacting will withdraw you from the game.\n\`Current players: ${this.currentPlayers.length}/7\``;
            message.channel.send({
                embeds: [e],
            })
                .then(async msg => {
                    const f = (reaction, user) => reaction.emoji.name == "change_color";// && user.id !== this.currentPlayers[0]; // change color reaction
                    let emoji = await message.guild.emojis.fetch('1001244981824065606');
                    console.log(`Emoji ID: ${emoji.name}, typeof: ${typeof emoji.name}`);
                    msg.react(emoji)
                        .catch(e => {
                            throw new Error(e);
                        })
                    if (TESTING) {
                        this.inProgress = true;
                        /**
                         * GAME CODE
                         */
                        run();
                        return;
                    }
                    let reactionCollector = msg.createReactionCollector({ filter: f, time: 30_000, dispose: true });
                    reactionCollector.on('collect', (reaction, user) => {
                        if (user === client.user || this.currentPlayers.find(e => e.id === user.id)) return;
                        console.log(`collect called for ${user.tag}`);
                        if (!this.inProgress) {
                            this.guildInfo.Guild.members.fetch(user).then(member => {
                                this.currentPlayers.push(member);
                                if (this.currentPlayers.length === MAX_PLAYERS) {
                                    this.inProgress = true;
                                    /**
                                     * GAME CODE
                                     */
                                    run();
                                } else {
                                    embed(client, e => {
                                        e.title = "Welcome to the Homies Bot UNO game!";
                                        e.description = `To join the game, please react to this message. Unreacting will withdraw you from the game.\n\`Current players: ${this.currentPlayers.length}/7\``;
                                        msg.edit({
                                            embeds: [e],
                                        })
                                            .catch(console.error);
                                    })
                                }
                            })
                                .catch(e => {
                                    throw new Error(e);
                                })
                        }
                        console.log(`Current players: ${this.currentPlayers}`);
                    });
                    reactionCollector.on('remove', (reaction, user) => {
                        if (!this.inProgress && user !== message.author) {
                            console.log(`remove called for ${user.tag}`);

                            for (let x = 0; x < this.currentPlayers.length; x++) {
                                let member = this.currentPlayers[x];
                                if (member.id === user.id) {
                                    let member = this.currentPlayers.splice(x, 1)[0];
                                    console.log(`${member.user.tag} unreacted to uno prompt`);
                                    embed(client, e => {
                                        e.title = "Welcome to the Homies Bot UNO game!";
                                        e.description = `To join the game, please react to this message. Unreacting will withdraw you from the game.\n\`Current players: ${this.currentPlayers.length}/7\``;
                                        msg.edit({
                                            embeds: [e],
                                        })
                                            .catch(console.error);
                                    })
                                }
                            }
                            console.log(`Current players: ${this.currentPlayers}`);
                        }
                    });
                    reactionCollector.on('end', (collection, reason) => {
                        if (!this.inProgress && this.currentPlayers.length >= MIN_PLAYERS) {
                            this.inProgress = true;
                            /**
                             * GAME CODE
                             */
                            run();
                        } else {
                            this.started = false;
                            if (reason.toLowerCase() === "messagedelete") {
                                embed(client, e => {
                                    e.title = "Welcome to the Homies Bot UNO game!";
                                    e.description = `The UNO join prompt was deleted. Please try again if you wish to play.\n\`Current players: ${this.currentPlayers.length}/7\``;
                                    e.footer.text = "Do NOT delete this prompt before the game has started.";
                                    message.channel.send({
                                        embeds: [e],
                                    })
                                        .catch(console.error);
                                });
                            } else {
                                embed(client, e => {
                                    e.title = "Welcome to the Homies Bot UNO game!";
                                    e.description = `Not enough players joined the game. Please try again if you wish to play.\n\`Current players: ${this.currentPlayers.length}/7\``;
                                    msg.edit({
                                        embeds: [e],
                                    })
                                        .catch(console.error);
                                });
                            }
                        }
                        reactionCollector = null;
                    });
                })
                .catch(e => {
                    throw new Error(e);
                });
        });
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
