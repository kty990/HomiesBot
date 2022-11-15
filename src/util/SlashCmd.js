const discord = require("discord.js");

const DEFAULT_BOOLEAN_OPTIONS = new discord.SlashCommandBooleanOption();
const DEFAULT_STRING_OPTIONS = new discord.SlashCommandStringOption();
const DEFAULT_INT_OPTIONS = new discord.SlashCommandIntegerOption();
const DEFAULT_CHANNEL_OPTIONS = new discord.SlashCommandChannelOption();
const DEFAULT_ATTACHMENT_OPTIONS = new discord.SlashCommandAttachmentOption();
const DEFAULT_MENTIONABLE_OPTIONS = new discord.SlashCommandMentionableOption();
const DEFAULT_NUMBER_OPTIONS = new discord.SlashCommandNumberOption();
const DEFAULT_ROLE_OPTIONS = new discord.SlashCommandRoleOption();

class SlashCommand {
    
    constructor() {
        this.builder = new discord.SlashCommandBuilder();
        this.DEFAULT_BOOLEAN = DEFAULT_BOOLEAN_OPTIONS;
        this.DEFAULT_STRING = DEFAULT_STRING_OPTIONS;
        this.DEFAULT_INT = DEFAULT_INT_OPTIONS;
        this.DEFAULT_CHANNEL = DEFAULT_CHANNEL_OPTIONS;
        this.DEFAULT_ATTACHMENT = DEFAULT_ATTACHMENT_OPTIONS;
        this.DEFAULT_MENTION = DEFAULT_MENTIONABLE_OPTIONS;
        this.DEFAULT_NUMBER = DEFAULT_NUMBER_OPTIONS;
        this.DEFAULT_ROLE = DEFAULT_ROLE_OPTIONS;
    }

    setName(name) {
        this.builder.setName(name);
    }

    booleanOption(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_BOOLEAN_OPTIONS;
        }
        this.builder.addBooleanOption(options);
    }

    stringOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_STRING_OPTIONS;
        }
        this.builder.addStringOption(options);
    }

    intOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_INT_OPTIONS;
        }
        this.builder.addIntegerOption(options);
    }

    channelOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_CHANNEL_OPTIONS;
        }
        this.builder.addChannelOption(options);
    }

    attachmentOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_ATTACHMENT_OPTIONS;
        }
        this.builder.addAttachmentOption(options);
    }

    mentionOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_MENTIONABLE_OPTIONS;
        }
        this.builder.addMentionableOption(options);
    }

    numberOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_NUMBER_OPTIONS;
        }
        this.builder.addNumberOption(options);
    }

    roleOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_ROLE_OPTIONS;
        }
        this.builder.addRoleOption(options);
    }

    /**
     * 
     * @param {SubSlashCommand} options 
     * @returns void
     */
    addSubCommand(options) {
        if (!options instanceof SubSlashCommand) {
            throw new Error(`Unable to add ${typeof(options)} sub_command`);
        }
        this.builder.addSubcommand(options);
    }


}

class SubSlashCommand {
    constructor() {
        this.builder = new discord.SlashCommandBuilder();
        this.DEFAULT_BOOLEAN = DEFAULT_BOOLEAN_OPTIONS;
        this.DEFAULT_STRING = DEFAULT_STRING_OPTIONS;
        this.DEFAULT_INT = DEFAULT_INT_OPTIONS;
        this.DEFAULT_CHANNEL = DEFAULT_CHANNEL_OPTIONS;
        this.DEFAULT_ATTACHMENT = DEFAULT_ATTACHMENT_OPTIONS;
        this.DEFAULT_MENTION = DEFAULT_MENTIONABLE_OPTIONS;
        this.DEFAULT_NUMBER = DEFAULT_NUMBER_OPTIONS;
        this.DEFAULT_ROLE = DEFAULT_ROLE_OPTIONS;
    }

    setName(name) {
        this.builder.setName(name);
    }

    booleanOption(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_BOOLEAN_OPTIONS;
        }
        this.builder.addBooleanOption(options);
    }

    stringOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_STRING_OPTIONS;
        }
        this.builder.addStringOption(options);
    }

    intOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_INT_OPTIONS;
        }
        this.builder.addIntegerOption(options);
    }

    channelOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_CHANNEL_OPTIONS;
        }
        this.builder.addChannelOption(options);
    }

    attachmentOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_ATTACHMENT_OPTIONS;
        }
        this.builder.addAttachmentOption(options);
    }

    mentionOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_MENTIONABLE_OPTIONS;
        }
        this.builder.addMentionableOption(options);
    }

    numberOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_NUMBER_OPTIONS;
        }
        this.builder.addNumberOption(options);
    }

    roleOptions(options) {
        if (options == null || options == undefined) {
            options = DEFAULT_ROLE_OPTIONS;
        }
        this.builder.addRoleOption(options);
    }
}

module.exports = { SlashCommand, SubSlashCommand };
