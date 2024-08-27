const crypto = require("crypto");

if (typeof global.crypto === "undefined") {
  global.crypto = {};
}

if (typeof global.crypto.getRandomValues === "undefined") {
  global.crypto.getRandomValues = function (buffer) {
    return crypto.randomFillSync(buffer);
  };
}
