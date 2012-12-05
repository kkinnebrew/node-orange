// functions

function stringToDate(string) {
  var parts = string.split('/');
  return new Date(parts[2], (parseInt(parts[0], 10) - 1), parts[1]);
}

function dateToString(date) {
  var dateObj = new Date(date);
  return (dateObj.getMonth()+1) + '/' + dateObj.getDate() + '/' + dateObj.getFullYear();
}

module.exports = {
  stringToDate: stringToDate,
  dateToString: dateToString
};