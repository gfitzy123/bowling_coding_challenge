const isNormalInteger = (str) => {
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
};

const isValidInput = (input) => {
  if (input < 0 || input > 10) {
    return false;
  }

  // When input is a string that is not an integer
  else if (typeof input === "string" && !utils.isNormalInteger(input)) {
    return false;
  }

  // And finally, if a number is not an integer
  else if (!Number.isInteger(input)) {
    return false;
  } else return true;
};

module.exports.isValidInput = isValidInput;
module.exports.isNormalInteger = isNormalInteger;
