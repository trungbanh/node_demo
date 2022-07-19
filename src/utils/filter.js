exports.filterData = function (obj, ...filterData) {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (filterData.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}