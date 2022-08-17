const embed = require('../homiesEmbed.js');

const aliases = {
    "play": ["p", "pl"],
    "skip": ["s"],
    "nowplaying": ["np"],
    "resume": ["res", "r"],
    "pause": ["pp"],
    "join": ["enter", "fuckon", "waxon", "appear"],
    "leave": ["fuckoff", "waxoff", "disappear"],
    "queue": ["q"],
    "say": [],
    "purge": [],
    "cmds": ["commands"],
    "aliases": ["als"],
    "help": [],
    "coinflip": ["flipcoin", "flipacoin"],
    "info": [],
    "serverinfo": [],
    "settings": ["alter", "change"],
    "cah": [],
    "password": ["pw"],
    "bugs": ["knownbugs", "bug"],
    "uno": [],
    "coup": [],
    "premove": [],
    "gtw": ["guesstheword"],
};


class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "aliases";
        this.description = "In development";
        // this.options = [
        //     {
        //         name: "page",
        //         description: "The page of aliases to display.",
        //         required: false,
        //         type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
        //     }
        // ];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client, page) {
        if (page === null || page === undefined) {
            page = 1;
        }
        if (page * 10 > Object.entries(aliases).length) {
            embed(client, myEmbed => {
                myEmbed.title = `Aliases Page ${page}`;
                myEmbed.description = "[empty]";
                myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}aliases [page number]`;
                message.channel.send({
                    embeds: [myEmbed],
                })
                    .catch(console.error);

            });
            return;
        }
        if (page <= 0) page = 1;
        var count = 0;//(page == 1) ? 0 : (page - 1) * 10;
        var alliases = "";
        for (const [command, allias] of Object.entries(aliases)) {


            // Choice 1
            if (allias == null || allias.length == 0 || aliases == undefined) {
                alliases = alliases + `${this.guildInfo.Get('prefix')}${command} : **n/a**\n`;
                continue;
            }
            // Choice 2 is to put [empty] in place of the allias(es)
            count++;
            if (count > ((page - 1) * 10) && count < (page * 10)) {
                var newallias = `${this.guildInfo.Get('prefix')}${command} : \`${this.guildInfo.Get('prefix')}${allias.join(", " + this.guildInfo.Get('prefix'))}\``;
                alliases = alliases + newallias + "\n";
            } else if (count >= (page * 10)) {
                break;
            }
        }

        if (alliases == "") {
            alliases = "[empty]";
        }

        let d = new Date();


        embed(client, myEmbed => {
            myEmbed.title = `Aliases Page ${page}`;
            myEmbed.description = alliases;
            myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}aliases [page number]`;
            message.channel.send({
                embeds: [myEmbed],
            })
                .catch(console.error);
        });
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns Promise
     */
    slashExe(interaction, client) {
        return new Promise((resolve, reject) => {
            const { options } = interaction;
            let page = options.getInteger("page", false);

            const channel = interaction.channel;

            if (page === null || page === undefined) {
                page = 1;
            }
            if (page <= 0) page = 1;
            let count = 0;
            let alliases = "";
            for (const [command, allias] of Object.entries(aliases)) {

                // Choice 1
                if (allias == null || allias.length == 0) {
                    alliases = alliases + "n/a\n";
                    continue;
                }
                // Choice 2 is to put [empty] in place of the allias(es)
                count++;
                if (count > (page - 1) * 10 && count < page * 10) {
                    let newallias = `${this.guildInfo.Get('prefix')}${command} : \`${this.guildInfo.Get('prefix')}${allias.join(", " + this.guildInfo.Get('prefix'))}\``;
                    alliases = alliases + newallias + "\n";
                } else if (count > page * 10) {
                    break;
                }
            }

            if (alliases == "") {
                alliases = "[empty]";
            }

            let d = new Date();


            embed(client, myEmbed => {
                myEmbed.title = "Aliases";
                myEmbed.description = alliases;
                myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}aliases [page number]`;
                channel.send({
                    embeds: [myEmbed],
                }, d.toISOString());
            });
            resolve(null);
        })
    }
}



module.exports = { command }
