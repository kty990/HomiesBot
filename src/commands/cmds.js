const embed = require('../homiesEmbed.js');

var commands = [ // required to edit as more commands are added
    "play [url / query]",
    "skip",
    "nowplaying",
    "resume",
    "pause",
    "shuffle",
    "join",
    "leave",
    "queue [page]",
    "loopqueue",
    "say [message]",
    "purge [count]",
    "cmds [page]",
    "aliases [page]",
    "help [command name]",
    "coinflip",
    "info",
    "serverinfo",
    "settings (WIP)",
    "cah (WIP)",
    "password [length]",
    "bugs [page]",
    "uno (WIP)",
    "premove",
    "gtw (WIP)"
].sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
});


class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "cmds";
        this.description = "In development";
        // this.options = [
        //     {
        //         name: "page",
        //         description: "The page of commands to display.",
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
        if (page <= 0) page = 1;
        var count = 0;
        var cmds = "";
        commands.forEach((v, i) => {
            count++;
            if (count > (page - 1) * 10 && count <= page * 10) {
                let newcmd = `**${count}.** ${this.guildInfo.Get('prefix')}${commands[i]}`;
                cmds = cmds + newcmd + "\n";
            }
        })

        if (cmds == "") {
            cmds = "[empty]";
        }

        let d = new Date();


        embed(client, myEmbed => {
            myEmbed.title = "Commands";
            myEmbed.description = cmds;
            myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}cmds [page number]`;
            message.channel.send({
                embeds: [myEmbed],
            }, d.toISOString());
        });
    }

    /**
     * 
     * @param {*} interaction 
     * @param {*} client 
     * 
     * @returns void
     */
    slashExe(interaction, client) {
        return new Promise((resolve, reject) => {
            const { options } = interaction;

            const channel = interaction.channel;
            let page = options.getInteger("page", false);

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
                channel.send({
                    embeds: [myEmbed],
                }, d.toISOString());
            });
            resolve(null);
        })
    }
}



module.exports = { command }
