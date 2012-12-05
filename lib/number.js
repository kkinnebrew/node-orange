function roundTo(number, precision) {
  var multiplier = Math.pow(10, precision || 0);
  var num = number * multiplier;
  num = Math.round(num);
  return num / multiplier;
}

module.exports = {
  roundTo: roundTo
};