const axios = require("axios");
exports.run = async (client, message, args, level) => {
  // eslint-disable-line no-unused-vars
  const replying = true;
  let branch = "master";
  if (args.length > 0) {
    branch = args[0];
  }

  const result = await githubWorkflowTrigger(branch);
  if (result == null) {
    message.reply({
      content: "Build started.",
      allowedMentions: { repliedUser: replying === "true" },
      ephemeral: true,
    });
  } else {
    message.reply({
      content: `Failed to dispatch workflow! ${result.message}`,
      allowedMentions: { repliedUser: replying === "true" },
      ephemeral: true,
    });
  }
};

async function githubWorkflowTrigger(branch) {
  const OWNER = process.env.MGITHUB_OWNER;
  const REPO = process.env.MGITHUB_REPO;
  const WORKFLOW_ID = "build-deploy.yml";
  const GITHUB_TOKEN = process.env.MGITHUB_WORKFLOW_TOKEN;

  const data = {
    ref: branch,
    inputs: {
      skip_node_install: "true",
    },
  };

  try {
    const URL = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`;
    await axios.post(URL, JSON.stringify(data), {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + GITHUB_TOKEN,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return null;
  } catch (err) {
    console.error(err);
    return err;
  }
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ghdeploy", "githubdeploy"],
  permLevel: "Bot Owner",
};

exports.help = {
  name: "ghdeploy",
  category: "System",
  description: "This will build and deploy the whole application from github.",
  usage: "ghdeploy [branch]",
};
