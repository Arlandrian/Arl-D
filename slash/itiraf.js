const discord = require("discord.js");
//const {ApplicationCommandOptionTypes, ApplicationCommandTypes} = require("discord.js/typings/enums")
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  let opts = interaction.options._hoistedOptions;
  let itiraf = opts[0].value
  let mahlas = opts.length > 1 ? opts[1].value : null;

  let msg = ""
  if(mahlas != null){
    msg += mahlas
    msg += ": "
  }
  msg += `${itiraf}`
  logger.log(`${interaction.user.tag} itiraf ${msg}`)
  interaction.channel.send(msg)
};


exports.commandData = {
  name: "itiraf",
  description: "Anonim bi şekilde mesaj atmanızı sağlar.",
  descriptionLocalizations: "",
  options: [
    {
      "name": "itiraf",
      "description": "İtirafın içeriği.",
      "type": 3,
      "required": true
    },
    {
      "name": "mahlas",
      "description": "İtirafı yazarken kullanmak istediğin mahlas.",
      "type": 3,
      "required": false
    }
  ],
  defaultPermission: true,
  type: 1
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: false
};