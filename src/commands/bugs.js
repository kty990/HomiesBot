const embed = require('../homiesEmbed.js');

const bugs = [
    "If a playlist is larger than 100 videos/songs, only the first 100 videos/songs are added to the queue",
    "If a playlist is entered as a video of the playlist, it currently does not recognize it as a playlist",
    "Occasionally the *AudioPlayer* instance will throw an error. The cause is currently unknown.",
    "UNO command does not allow player to select card to play. **Fix in progress**"
];

function isInt(value) {
    try {
        let v = parseInt(value);
        if (v == value) {
            return true;
        } else {
            return false;
        }
    } catch (e) { }
    return false;
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "bugs";
        this.description = "In Development";
        this.options = [];
        this.aliases = ["knownbugs", "bug"];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {int | string | null} page
    */
    async exe(message, client, page) {
        if (page === null || page === undefined) {
            page = 1;
        } else if (!isInt(page)) {
            page = 1;
        }
        if (page <= 0) page = 1;

        var count = 0;
        var result = "";
        bugs.forEach((v, i) => {
            count++;
            if (count > (page - 1) * 10 && count <= page * 10) {
                let r = `**${count}.** ${bugs[i]}`;
                result = result + r + "\n";
            }
        })

        if (result == "") {
            result = "[empty]";
        }

        embed(client, myEmbed => {
            myEmbed.title = `Known Bugs | Page ${page}`;
            myEmbed.description = result;
            myEmbed.footer.text = `Say ${this.guildInfo.Get('prefix')}bugs [page number]`;
            message.channel.send({
                embeds: [myEmbed],
            });
        });
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
