function yyyymmdd(dateIn) {
  if (!dateIn) {
    dateIn = new Date()
  }

  var yyyy = dateIn.getFullYear();
  var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
  var dd = dateIn.getDate();
  return String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
}


module.exports = yyyymmdd