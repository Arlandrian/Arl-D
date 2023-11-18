// Define a simple "channel" class
class Channel {
  constructor() {
    this.queue = [];
  }

  // Send data to the channel
  send(data) {
    this.queue.push(data);
  }

  // Receive data from the channel
  async receive() {
    while (this.queue.length === 0) {
      // Wait for data to be available
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Pop and return the first item in the queue
    return this.queue.shift();
  }
}

module.exports = { Channel };