const discord = require("discord.js");
const videoedit = require("../modules/videoedit");
exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });
  const opts = interaction.options._hoistedOptions;
  const url = opts[0].value;
  const startSec = getOption(opts, "StartSec", 0);
  const endSec = getOption(opts, "EndSec", 0);
  await interaction.editReply(
    ":factory_worker: => :cyclone:video düzenleniyor, lütfen bekleyin...:cyclone:"
  );
  const startTime = performance.now();
  await videoedit.downloadVideoAsMp3(
    url,
    startSec,
    endSec,
    async (audioPath) => {
      console.debug("cmd::audiodl: sending attachment file " + audioPath);
      const audioAttachment = new discord.MessageAttachment(audioPath);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      await interaction.editReply(`audio hazır:white_check_mark: ${elapsedTime.TS()}`);
      await interaction.editReply({ files: [audioAttachment] });
    }
  );
};

function getOption(opts, name, defValue) {
  const provided = opts.find((x) => x.name.toLowerCase() == name.toLowerCase());
  if (provided == null) {
    return defValue;
  } else {
    return provided.value;
  }
}

exports.commandData = {
  name: "audiodl",
  description: "Downloads the given url from the source.",
  descriptionLocalizations: {
    tr: "Audio indir.",
  },
  options: [
    {
      name: "url",
      description: "url",
      type: 3,
      required: true,
    },
    {
      name: "startsec",
      description: "audio start point for the cut",
      descriptionLocalizations: {
        tr: "ses dosyasının kesilmeye baslanacak noktanin saniyesi",
      },
      type: 4,
      required: false,
      min_value: 0,
      max_value: 7200,
    },
    {
      name: "endsec",
      description: "audio end point for the cut",
      descriptionLocalizations: {
        tr: "ses dosyasının kesilmenin biteceği noktanin saniyesi",
      },
      type: 4,
      required: false,
      min_value: 0,
      max_value: 7200,
    },
  ],
  // defaultMemberPermissions: discord.Permissions.FLAGS.BAN_MEMBERS,
  dmPermission: true,
  type: 1,
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "Moderator",
  guildOnly: false,
};
