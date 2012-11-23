// functions

function stringToDate(string) {
  var parts = string.split('/');
  return new Date(parts[2], (parseInt(parts[0], 10) - 1), parts[1]);
}

module.exports = {
  stringToDate: stringToDate
};