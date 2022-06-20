console.log("Loading... homiesEmbed.js");

module.exports = (Discord, client, callback) => {
    const d = new Date();
    const self = client.user;
    const embed = new Discord.MessageEmbed()
    .setAuthor(self.tag, self.avatarURL({size : 256}))
    .setColor(0xb7a8ff)
    .setTimestamp(d.toISOString());

    callback(embed);
}

console.log("homiesEmbed.js loaded... Success!");