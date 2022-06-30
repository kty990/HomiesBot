const embed = require('../homiesEmbed.js');

/**
 * 
 * @param {*} message 
 * @param {*} client 
 * @param {null} args 
 */
function exe(message, client, args) {
    const channel = message.channel;
    let d = new Date();
    let timeSinceEpoch = Math.round(Date.now());
    let difference = Math.round(message.createdTimestamp - timeSinceEpoch) / 1000;
    embed(client, embed => {
        embed.description = `Pong: ${difference}s`;
        embed.timestamp = null;
        channel.send({
            embeds: [embed]
        }, d.toISOString())
            .catch(console.error);
    })
}



module.exports = { exe }
