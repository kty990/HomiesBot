const embed = require('../homiesEmbed.js');
const Discord = require('discord.js');

const commands = [ // required to edit as more commands are added
    "play",
    "skip (WIP)",
    "nowplaying",
    "resume",
    "pause",
    "join",
    "leave",
    "queue",
    "say",
    "cmds",
    "aliases",
    "help (WIP)",
    "info (WIP)",
    "serverinfo (WIP)",
    "settings (WIP)",
    "cah (WIP)",
];


class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "cmds";
        this.description = "In development";
        this.options = [
            {
                name: "page",
                description: "The page of commands to display.",
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
        commands.forEach((v, i) => {
            count++;
            if (count > (page - 1) * 10 && count <= page * 10) {
                var newallias = `${count}. ${this.guildInfo.Get('prefix')}${commands[i]}`;
                alliases = alliases + newallias + "\n";
            }
        })

        if (alliases == "") {
            alliases = "[empty]";
        }

        let d = new Date();


        embed(client, myEmbed => {
            myEmbed.title = "Commands";
            myEmbed.description = alliases;
            myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}cmds [page number]`;
            message.channel.send({
                embeds: [myEmbed],
            }, d.toISOString());
        });
    }
}



module.exports = { command }