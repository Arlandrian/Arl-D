const discord = require("discord.js");
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  let opts = interaction.options._hoistedOptions;
  
  let boy = Number(opts[0].value)
  let kilo = Number(opts[1].value)
  let yas = Number(opts[2].value)

  let bazalMetabolizma = (13.75*kilo) + (5.03*boy) - (6.75*yas) + 66.5
  await interaction.editReply(`Bazal metabilizma hızınız: ${bazalMetabolizma}`);
};

exports.commandData = {
  name: "bazal",
  description: "Verilen bilgilere göre bazal metabolizma hızınızı hesaplar.",
  options: [
    {
      "name": "boy",
      "description": "Boyunuzu santimetre cinsinden giriniz.",
      "type": 4,
      "required": true
    },
    {
      "name": "kilo",
      "description": "Kilonuzu kilogram cinsinden giriniz.",
      "type": 4,
      "required": true
    },
    {
      "name": "yas",
      "description": "Yaşınızı giriniz.",
      "type": 4,
      "required": true
    }
  ],
  defaultPermission: true,
  type: 1//ApplicationCommandTypes.USER
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: false
};