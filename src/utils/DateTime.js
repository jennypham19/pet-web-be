const dayjs = require('dayjs');

const IsValid = (date) => {
    if (!date) return false;
    return dayjs(date).isValid();
};

const FormatDate = (value, pattern = 'DD/MM/YYYY') => {
    return IsValid(value) ? dayjs(value).format(pattern) : null;
};

module.exports = {
    FormatDate,
    IsValid
}