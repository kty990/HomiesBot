const embed = require('../homiesEmbed.js');
const Discord = require('discord.js');

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
    "cmds": ["commands"],
    "aliases": ["als"],
    "help": [],
    "info": [],
    "serverinfo": [],
    "settings": ["alter", "change"],
    "cah": [],
};


class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "aliases";
        this.description = "In development";
        this.options = [
            {
                name: "page",
                description: "The page of aliases to display.",
                required: false,
                type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
            }
        ];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    exe(message, client, page) {
        if (page === null || page === undefined) {
            page = 1;
        }
        if (page <= 0) page = 1;
        var count = 0;
        var alliases = "";
        for (const [command, allias] of Object.entries(aliases)) {

            // Choice 1
            if (allias == null || allias.length == 0) continue;
            // Choice 2 is to put [empty] in place of the allias(es)
            count++;
            if (count > (page - 1) * 10 && count < page * 10) {
                var newallias = `${this.guildInfo.Get('prefix')}${command} : \`${this.guildInfo.Get('prefix')}${allias.join(", " + this.guildInfo.Get('prefix'))}\``;
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
            message.channel.send({
                embeds: [myEmbed],
            }, d.toISOString());
        });
    }
}



module.exports = { command }