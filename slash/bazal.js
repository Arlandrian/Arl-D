const discord = require("discord.js");
const logger = require("../modules/logger")
exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: true });
  let opts = interaction.options._hoistedOptions;
  let boy = opts[0]
  let kilo = opts[1]
  let yas = opts[2]
  let bazalMetabolizma = (13.75*kilo) + (5.03*boy) - (6.75*yas) + 66.5
  await interaction.editReply(`Bazal metabilizma hızınız: ${bazalMetabolizma}`);
};

exports.commandData = {
  name: "BazalHesapla",
  description: "Verilen bilgilere göre bazal metabolizmanızı hesaplar.",
  options: [
    {
      "name": "Boy",
      "description": "Boyunuzu santimetre cinsinden giriniz.",
      "type": 4,
      "required": true
    },
    {
      "name": "Kilo",
      "description": "Kilonuzu kilogram cinsinden giriniz.",
      "type": 4,
      "required": true
    },
    {
      "name": "Yaş",
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