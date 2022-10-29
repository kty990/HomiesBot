const embed = require('../homiesEmbed.js');

const TESTING = false;

function isInt(query) {
    try {
        let value = parseInt(query);
        if (value == query) {
            return true;
        }
    } catch (e) { }
    return false;
}

function getUser(guild, query) {
    return new Promise((resolve, reject) => {
        if (query === null || query === undefined) resolve(false);
        if (query.includes("<@")) {
            // mention
            query = query.replace("<@", "").replace(">", "");
            guild.members.fetch(query).then(member => {
                resolve(member?.user || false);
            }).catch(console.error);
        } else if (isInt(query)) {
            guild.members.fetch(query).then(member => {
                resolve(member?.user || false);
            }).catch(e => {
                reject(`${e}`);
            });
        } else {
            let result = guild.client.users.cache.find(user => user.username.substring(0, query.length).toLowerCase() == query.toLowerCase());
            if (result) {
                resolve(result);
            } else {
                reject(`Unable to find user by username or other query: ${query}`);
            }
        }

    })

}

function convertToReadableTime(sinceEpoch) {
    let date = new Date();
    let currentSinceEpoch = date.getTime();
    sinceEpoch = Math.abs(currentSinceEpoch - sinceEpoch);
    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = Math.floor(sinceEpoch / 1000);

    minutes = Math.floor(seconds / 60);
    hours = Math.floor(minutes / 60);
    days = Math.floor(hours / 24);
    months = Math.floor(days / 30.4166667);
    years = Math.floor(months / 12);

    seconds = seconds - (minutes * 60);
    minutes = minutes - (hours * 60);
    hours = hours - (days * 24);
    days = Math.floor(days - (months * 30.4166667));
    months = months - (years * 12);

    return `${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.name = "info";
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
         * Optional arg of user, if no user provided, defaults to message.author
         * 
         * - User's tag (ie. phxntxsmic#2022)
         * - User's avatar as thumbnail
         * - How long user has been in the server 
         * - How old the user's account is (?)
         * - User's roles in the server
         * - All permissions the user has in the server
         * 
         * 
         */

        let user = await getUser(message.guild, args[0]).catch(e => {
            throw new Error(e);
        });
        if (!user) {
            user = message.author;
        }
        let member = await message.guild.members.fetch(user.id);

        let tag = user.tag;
        let avatar = user.avatarURL({ size: 256 });
        let timeInGuild = `<t:${Math.round(member.joinedTimestamp / 1000)}:D>`; // likely seconds since epoch time, format to years/months/days/hours/minutes/seconds
        let accountAge = `<t:${Math.round(user.createdTimestamp / 1000)}:D>`; // timestamp for account creation?
        let rolesObj = member.roles.cache; // format properly into string
        let roles = "";
        let permissions = [];
        rolesObj.forEach((role, ID) => {
            if (role.name !== "@everyone") {
                roles = roles + `\`${role.name}\`, `;
                let localPerms = role.permissions.toArray();
                for (let x = 0; x < localPerms.length; x++) {
                    let perm = localPerms[x];
                    if (!permissions.includes(`\`${perm}\``)) {
                        permissions.push(`\`${perm}\``);
                    }
                }
                roleCount++;
            }
        });

        if (permissions.length !== 0) {
            permissions.sort((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });
            permissions = permissions.join(", ");
        }

        roles = roles.substring(0, roles.length - 2);

        if (roles.length == 0) {
            roles = "`@everyone`";
        }

        let desc = `**Tag:**\t${tag}\n**ID:**\t${user.id}\n**Joined Guild:**\t${timeInGuild}\n**Account Age:**\t${accountAge}\n**Roles:**\t${roles}`;


        embed(client, embed => {
            embed.description = (TESTING === false || message.author.tag === "phxntxsmic#2022") ? desc : "Command under development.";
            if (TESTING === false || message.author.tag === "phxntxsmic#2022") {
                embed.fields.push({
                    name: "Permissions",
                    value: permissions,
                    inline: false,
                })
            }
            embed.thumbnail = {
                url: avatar,
            };
            message.reply({
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
