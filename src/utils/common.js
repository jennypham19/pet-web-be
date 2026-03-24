const isEmptyObject = (obj) => {
  return Object.values(obj).every(
    (value) =>
      value === null ||
      value === undefined ||
      value === ''
  );
};

module.exports = {
    isEmptyObject
}