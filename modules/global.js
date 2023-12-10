Number.prototype.TS = function () {
  // millisec
  const millisec = this.valueOf();
  if (millisec < 5000) {
    // If less than 5 millisec
    return `${millisec.toFixed(2)} ms`;
  } else {
    // If 5 millisec or more, print in seconds
    const seconds = millisec / 1000;
    return `${seconds.toFixed(2)} s`;
  }
};
