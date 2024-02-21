const discord = require("discord.js");
const videoedit = require("../modules/videoedit");
exports.run = async (client, interaction) => {
  // eslint-disable-line no-unused-vars
  await interaction.deferReply({ ephemeral: false });
  const opts = interaction.options._hoistedOptions;
  const videoURL = opts[0].value;
  const videoStartSec = getOption(opts, "videoStartSec", 0);
  const videoEndSec = getOption(opts, "videoEndSec", 0);
  const ffmpegOpts = getOption(opts, "ffmpeg", "");
  const title = getOption(opts, "title", "");
  await interaction.editReply(
    ":factory_worker: => :cyclone:video düzenleniyor, lütfen bekleyin...:cyclone:"
  );
  const startTime = performance.now();
  await videoedit.downloadVideo(
    videoURL,
    videoStartSec,
    videoEndSec,
    ffmpegOpts,
    async (videoPath) => {
      console.debug("cmd::videodl: sending attachment file " + videoPath);
      const videoAttachment = new discord.MessageAttachment(videoPath);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      await interaction.editReply(`${title} :white_check_mark: ${elapsedTime.TS()}`);
      await interaction.editReply({ files: [videoAttachment] });
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
  name: "videodl",
  description: "Downloads the given url from the source.",
  descriptionLocalizations: {
    tr: "Video indir.",
  },
  options: [
    {
      name: "url",
      description: "url",
      type: 3,
      required: true,
    },
    {
      name: "videostartsec",
      description: "video start point for the cut",
      descriptionLocalizations: {
        tr: "videoda kesilmeye baslanacak noktanin saniyesi",
      },
      type: 4,
      required: false,
      min_value: 0,
      max_value: 7200,
    },
    {
      name: "videoendsec",
      description: "video end point for the cut",
      descriptionLocalizations: {
        tr: "videoda kesilmenin biteceği noktanin saniyesi",
      },
      type: 4,
      required: false,
      min_value: 0,
      max_value: 7200,
    },
    {
      name: "ffmpeg",
      description: "you can give custom ffmpeg options. (other args will be ignored)",
      descriptionLocalizations: {
        tr: "kendi ffmpeg ayarlarınızı verebilirsiniz. (diğer ayarlar görmezden gelinir)",
      },
      type: 3,
      required: false,
    },
    {
      name: "title",
      description: "you can give a title so discord search can index the message.",
      descriptionLocalizations: {
        tr: "discord aramasında gözükebilmesi için videoya başlık verebilirsiniz",
      },
      type: 3,
      required: false,
    },
  ],
  // defaultMemberPermissions: discord.Permissions.FLAGS.BAN_MEMBERS,
  // defaultMemberPermissions: 1 << 46, // SEND_VOICE_MESSAGES
  dmPermission: true,
  type: 1,
};

// Set guildOnly to true if you want it to be available on guilds only.
// Otherwise false is global.
exports.conf = {
  permLevel: "User",
  guildOnly: false,
};
