// TimeWindowedMessageThrottler.js
class TimeWindowedMessageThrottler {
  constructor(limit, windowSize) {
    this.limit = limit; // Number of messages allowed
    this.windowSize = windowSize; // Time window in milliseconds
    this.windowStart = Date.now(); // Initialize the start of the time window
    this.messageCount = 0; // Initialize message count to 0
  }

  windowEnd() {
    return this.windowStart + this.windowSize;
  }

  canSendMessage() {
    const now = Date.now();
    const timePassed = now - this.windowStart;
    // If we are outside the time window, reset the message count and start a new window
    if (timePassed > this.windowSize) {
      this.windowStart = now;
      this.messageCount = 0;
      return true;
    }

    // Check if we are within the time window, and if the message count is below the limit
    if (this.messageCount < this.limit) {
      return true;
    }

    return false;
  }

  onSendMessage() {
    if (this.canSendMessage()) {
      // Increment the message count
      this.messageCount++;
      return true;
    } else {
      return false;
    }
  }
}

class UserMessageThrottler {
  constructor() {
    this.userThrottlers = new Map();
  }

  exists(guildId, userId) {
    const key = `${guildId}:${userId}`;
    return this.userThrottlers.has(key);
  }

  // Public method to add a user and their throttler to the dictionary
  addUser(guildId, userId, limit, windowSize) {
    const userThrottler = new TimeWindowedMessageThrottler(limit, windowSize);
    const key = `${guildId}:${userId}`;
    this.userThrottlers.set(key, userThrottler);

    // Set a timeout to remove the user and throttler after a certain time (e.g., 1 hour)
    const removalTimeout = 60 * 60 * 1000; // 1 hour in milliseconds
    this._scheduleRemovalTimeout(guildId, userId, removalTimeout);
  }

  // Public method to remove a user and their throttler from the dictionary
  removeUser(guildId, userId) {
    const key = `${guildId}:${userId}`;
    const throttler = this.userThrottlers.get(key);

    // Check if the user is rate-limited
    if (throttler && throttler.canSendMessage()) {
      // Restart the removal timeout for the user
      const removalTimeout = 60 * 60 * 1000; // 1 hour in milliseconds
      clearTimeout(throttler.removalTimeoutId);
      this._scheduleRemovalTimeout(guildId, userId, removalTimeout);
    } else {
      this.userThrottlers.delete(key);
    }
  }

  // Private method to schedule the removal timeout for a user
  _scheduleRemovalTimeout(guildId, userId, timeout) {
    const key = `${guildId}:${userId}`;
    const removalTimeoutId = setTimeout(() => {
      this.removeUser(guildId, userId);
    }, timeout);

    // Store the removal timeout ID in the throttler for later reference
    const throttler = this.userThrottlers.get(key);
    if (throttler) {
      throttler.removalTimeoutId = removalTimeoutId;
    }
  }

  // Public method to check if a user can send a message
  canSendMessage(guildId, userId) {
    const key = `${guildId}:${userId}`;
    const throttler = this.userThrottlers.get(key);
    return throttler && throttler.canSendMessage();
  }

  // Public method to handle sending a message
  onSendMessage(guildId, userId) {
    const key = `${guildId}:${userId}`;
    const throttler = this.userThrottlers.get(key);

    if (throttler) {
      return throttler.onSendMessage();
    }
    return true;
  }
}

// Create a singleton instance of UserMessageThrottler
const userMessageThrottler = new UserMessageThrottler();

module.exports = userMessageThrottler;
