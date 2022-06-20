console.log("Loading... error.js");
module.exports = (Discord, client, message, callback) => {
    const self = client.user;
    var d = new Date();

    // Util specific logic
    var embed = new Discord.MessageEmbed()
    .setAuthor(self.tag, self.avatarURL({size : 256}))
    .setColor(0xcc0000)
    .setTimestamp(d.toISOString())
    .setFooter("Error");

    callback(embed);
}

console.log("error.js loaded... Success!");
