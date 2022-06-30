// ** Dependancies **

const fs = require('fs');
const { Guild } = require('discord.js');

// ** Misc. Variables **

const DEFAULT_PREFIX = "//";

// ** Functions & Classes **

// Local function
function DeleteData(path) {
    try {
        fs.unlink(path, err => {
            if (err) {
                console.error(err);
            }
        });
    } catch (err) {
        console.error("Unable to delete file.");
    }
}

/**
 * Caches data, and periodically saves the data to a local store.
 * Has force save method for when bot goes down for maintenance
 */
class DatastoreHandler {
    /**
     * 
     * @param {Guild} guild 
     * @param {boolean | null} autoload 
     */
    constructor(guild, autoload) {
        this.cache = {
            "prefix": DEFAULT_PREFIX,
            "admin_role": null,
            "song_announcement": true,
            "log_channel": null,
            "should_log": true
        };
        this.path = `data_${guild.id}.txt`;
        this.Guild = guild;
        this.Locked = false;
        this.keys = [];

        if (autoload) {
            this.Load();
        }
    }

    /**
     * This method loads existing data from local store if applicable.
     * 
     * @returns null
     */
    Load() {
        if (this.Locked) {
            console.warn("Attempt to load data onto locked Datastore...");
            return;
        }
        try {
            fs.readFile(this.path, 'utf8', (err, data) => {
                if (!err) {
                    if (!data) {
                        console.error(`Error loading data for "${this.Guild.name}" (${this.Guild.id})`);
                        return;
                    }
                    let splitString = data.split('\n');
                    for (let x = 0; x < splitString.length; x++) {
                        let keyValue = splitString[x].split(":");
                        if (keyValue) {
                            // Extra check to be sure, may be removed in later version
                            if (keyValue.length === 2) {
                                // Loaded key-value pair has been validated 
                                this.Cache[keyValue[0]] = keyValue[1];
                            }
                        }
                    }
                } else {
                    console.warn(`WARN: ${err}`);
                    return;
                }
            });
        } catch (e) { }
        console.log(`Successfully loaded data for "${this.Guild.name}" (${this.Guild.id})`);
    }

    /**
     * 
     * @returns null
     */
    Save() {
        if (this.Locked) {
            console.warn("Attempt to save locked Datastore...");
            return;
        }
        try {
            var data = "";
            for (let x = 0; x < this.keys.length; x++) {
                let CurrentKey = this.keys[x];
                data = data + `${CurrentKey}:${this.Cache[CurrentKey]}\n`;
            }

            fs.writeFile(this.path, data, 'utf8', err => {
                if (err) {
                    console.error(`Error saving data for "${this.Guild.name}" (${this.Guild.id}): ${err}`);
                }
            });
        } catch (e) {
            console.warn(e);
        }
    }

    /**
     * 
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    UpdateCache(key, value) {
        if (this.Locked) {
            console.warn("Attempt to update locked Datastore...");
            return;
        }
        if (!this.keys.includes(key)) this.keys.push(key);
        if (value === null) {
            this.keys.splice(this.keys.findIndex(k => k == key), 1);
        }
        this.cache[key] = value;
    }

    /**
     * 
     * @param {string} key 
     * @returns string | null
     */
    Get(key) {
        if (this.Locked) {
            console.warn("Attempt to get value from locked Datastore...");
            return;
        }
        return this.cache[key];
    }

    /**
     * @returns null
     */
    MakeDefault() {
        DeleteData(this.path);
    }
}

module.exports = { DatastoreHandler };
