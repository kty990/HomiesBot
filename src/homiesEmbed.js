console.log("Loading... homiesEmbed.js");

module.exports = (client, callback) => {
    const d = new Date();
    const self = client.user;

    callback({
        description: "\u2800",
        fields: [],
        author: {
            name: self.username,
            icon_url: self.avatarURL({ size: 256 })
        },
        color: 0xb7a8ff,
        timestamp: d.toISOString(),
        footer: {
            text: '\u2800',
            icon_url: '',
        },
    });
}

console.log("homiesEmbed.js loaded... Success!");
