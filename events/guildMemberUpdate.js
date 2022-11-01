const logger = require("../modules/logger.js");
const { getSettings } = require("../modules/functions.js");
// This event executes when a new member joins a server. Let's welcome them!

module.exports = (client, oldMember, newMember) => {
  // Load the guild's settings
  logger.log(oldMember, "log")
  logger.log("|||||||||||||||", "log")
  logger.log(newMember, "log")
};
