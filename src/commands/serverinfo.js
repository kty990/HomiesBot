const embed = require('../homiesEmbed.js');
const discord = require('discord.js');

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = true;

        this.name = "serverinfo";
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
        let currentMembers = await message.guild.members.fetch({ withPresences: true, cache: false });

        let online = currentMembers.filter(member => (member.presence?.equals(discord.PresenceUpdateStatus.Offline) === true || member.presence === null) ? false : true).size;

        let total = currentMembers.filter(() => true).size;

        let bot = currentMembers.filter(member => member.user.bot).size;

        let text = message.guild.channels.cache.filter((c) => c.type == discord.ChannelType.GuildText).size;
        if (text === 0) {
            let temp = await message.guild.channels.fetch();
            text = temp.filter(c => c.type == discord.ChannelType.GuildText).size;
        }

        let voice = message.guild.channels.cache.filter((c) => c.type == discord.ChannelType.GuildVoice).size;
        if (voice === 0) {
            let temp = await message.guild.channels.fetch();
            voice = temp.filter(c => c.type == discord.ChannelType.GuildVoice).size;
        }

        let stage = message.guild.channels.cache.filter((c) => c.type == discord.ChannelType.GuildStageVoice).size; //??
        if (stage === 0) {
            let temp = await message.guild.channels.fetch();
            stage = temp.filter(c => c.type == discord.ChannelType.GuildStageVoice).size;
        }

        let thread = message.guild.channels.cache.filter((c) => c.type == discord.ChannelType.GuildPublicThread || c.type == discord.ChannelType.GuildPrivateThread).size; //??
        if (thread === 0) {
            let temp = await message.guild.channels.fetch();
            thread = temp.filter(c => c.type == discord.ChannelType.GuildPublicThread || c.type == discord.ChannelType.GuildPrivateThread).size;
        }

        let news = message.guild.channels.cache.filter((c) => c.type == discord.ChannelType.GuildNews).size; //??
        if (news === 0) {
            let temp = await message.guild.channels.fetch();
            news = temp.filter(c => c.type == discord.ChannelType.GuildNews).size;
        }

        let categories = message.guild.channels.cache.filter((c) => c.type == discord.ChannelType.GuildCategory).size;
        if (categories === 0) {
            let temp = await message.guild.channels.fetch();
            categories = temp.filter(c => c.type == discord.ChannelType.GuildCategory).size;
        }

        let roles = message.guild.roles.cache.size;

        embed(client, embed => {
            embed.description = `**__Members__**\n**Online Users:** ${online}\n**Bots:** ${bot}\n**Total Users:** ${total}`;
            embed.fields.push({
                name: "__Channels__",
                value: `**Text Channels:** ${text}\n**Voice Channels:** ${voice}\n**Stage Channels:** ${stage}\n**Thread Channels:** ${thread}\n**Announcement Channels:** ${news}\n**Categories:** ${categories}`,
                inline: false,
            });
            embed.fields.push({
                name: "__Misc.__",
                value: `**Roles:** ${roles}\n`,
                inline: false,
            });
            embed.footer.text = `${this.guildInfo.Guild} server info`;
            message.channel.send({
                embeds: [embed],
            })
                .catch(console.error);
        })
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
