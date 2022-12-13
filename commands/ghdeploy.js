const axios = require('axios');
const config = require("../config.js");
const { settings } = require("../modules/settings.js");
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const replying = settings.ensure(message.guild.id, config.defaultSettings).commandReply;
  let result = await githubWorkflowTrigger();
  if(result==null){
    message.reply({ content: `Build started.`, allowedMentions: { repliedUser: (replying === "true") }});
  }else{
    message.reply({ content: `Failed to dispatch workflow! ${result.message}`, allowedMentions: { repliedUser: (replying === "true") }});
  }
};

async function githubWorkflowTrigger() {
  const OWNER = process.env.MGITHUB_OWNER
  const REPO = process.env.MGITHUB_REPO
  const WORKFLOW_ID = "build-deploy.yml"
  const GITHUB_TOKEN = process.env.MGITHUB_WORKFLOW_TOKEN

  const data = {
    ref: "master"
    // ,
    // inputs: {
    //   "name": "Mona the Octocat",
    //   "home": "San Francisco, CA"
    // }
  }

  try{
    const URL = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`
    const response = await axios.post(
      URL,
      JSON.stringify(data),
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + GITHUB_TOKEN,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    return null
  }catch(err){
    console.error(err)
    return err
  }
}

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["ghdeploy","githubdeploy"],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "ghdeploy",
  category: "System",
  description: "This will build and deploy the whole application from github.",
  usage: "ghdeploy"
};
