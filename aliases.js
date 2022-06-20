console.log("Loading... aliases.js");
const {a} = require('./info/a');
const aliases = a;
module.exports = (prefix, input, command, callback) => {
    var result = false;
    if (`${prefix}${command}` == input) result = true;
    for([key,value] of Object.entries(aliases)){
        if (value.length == 0 || value == null) continue;
        if (result) break;
        if (command == key){
            const tempAliases = value;
            for (i = 0; i < tempAliases.length; i++){
                var alias = tempAliases[i];
                if (`${prefix}${alias}` == input){
                    result = true;
                    break;
                }
            }
        }
    }
    callback(result);
}
console.log("aliases.js loaded... Success!");
