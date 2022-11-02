/**
 * IMPORTANT: Access to this command is highly restricted due to security issues.
 */

const { PythonShell } = require('python-shell');

const embed = require('../../homiesEmbed.js');
const { download } = require('../../util/stream.js');

class whitelist {
    constructor() {
        // Stored using the user's ID.
        this.allowed = require('./whitelist.json')['pywhitelist'];
    }

    IsWhitelisted(user_id) {
        for (let id of this.allowed) {
            if (user_id === id) {
                return true;
            }
        }
        return false;
    }
}

class command {
    constructor(guildInfo) {
        this.isMusic = false;
        this.guildInfo = guildInfo;
        this.shouldDelete = false;

        this.allowed = new whitelist();

        this.name = "testpy";
        this.description = "In development";
        this.options = [];
        this.aliases = ["runpy", "pyrun"];
    }

    /**
     * 
     * @param {*} message : Discord.js Message object
     * @param {*} client : Client
     * @param {null} args 
    */
    async exe(message, client) {
        if (!this.allowed.IsWhitelisted(message.author.id)) {
            throw new Error("This is a secret command. Only whitelisted developers and moderators have access to this command.");
        }
        let content = message.content.split(" ");
        /**
         * TODO:
         * Do check in content for illegal/unaccepted code                    INCOMPLETE
         * Run code -> Provide truncated (if necessary) output to user        COMPLETED
         * 
         * Input types for code:
         *      - message.content                                             COMPLETED
         *      - message attachments if filetype in [.txt]                   INCOMPLETE
         */

        content.splice(0, 1); // removes command from content

        // Do check for unaccepted code

        let syntaxSafe = true;
        PythonShell.checkSyntax(content.join(" ")).then(() => { }).catch(e => {
            syntaxSafe = false;
            console.error(e);
        });

        if (syntaxSafe === false) {
            throw new Error("Unable to run testpy as there was a syntax error in the code.\nMore details provided in bot console.");
        }
        if (content.indexOf("import") !== -1) {
            throw new Error("Error 403: Use of 'import' keyword forbidden.");
        }

        content = content.join(" ")
        PythonShell.runString(content, undefined, (err, output) => {
            // Run code
            if (err) {
                embed(client, myEmbed => {
                    myEmbed.color = 0xeb4034;
                    myEmbed.title = "TESTPY ERROR";
                    myEmbed.description = `${err}`;
                    myEmbed.footer.text = `Command run by ${message.author.tag}`;
                    message.channel.send({ embeds: [myEmbed] })
                        .catch(console.error);
                });
                return;
            }
            embed(client, myEmbed => {
                myEmbed.title = `Result of ${message.author.tag}'s ${this.guildInfo.Get('prefix')}pytest`;
                myEmbed.description = "New lines are separated by commas.";

                // Truncate if necessary : 1024 char max per field value
                let remaining = output;
                let addedChars = 0;
                if (remaining != undefined && remaining != null) {
                    while (remaining.length > 0) {
                        if (remaining.length > 1024) {
                            myEmbed.fields.push(
                                {
                                    name: "\u2800",
                                    value: `${remaining.substring(0, 1024)}`,
                                    inline: false
                                }
                            )
                            remaining = remaining.substring(1024);
                            if (addedChars > (1024 * 4)) {
                                myEmbed.fields.push(
                                    {
                                        name: "\u2800",
                                        value: `(...) omitted the rest of the output, exceeded ${1024 * 4} characters`,
                                        inline: false
                                    }
                                )
                                break;
                            }
                        } else {
                            myEmbed.fields.push(
                                {
                                    name: "\u2800",
                                    value: `${remaining}`,
                                    inline: false,
                                }
                            );
                            break;
                        }
                    }
                } else {
                    myEmbed.fields.push(
                        {
                            name: "\u2800",
                            value: `No output`,
                            inline: false
                        }
                    )
                }


                myEmbed.footer.text = `Python code run successfully...`;
                message.channel.send({
                    embeds: [myEmbed],
                })
                    .catch(console.error);
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
