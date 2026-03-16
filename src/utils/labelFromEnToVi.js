const { statusTypes } = require("../constants/status");

const getLabelEvaluatedStatus = (status) => {
    switch (status) {
        case statusTypes.APPROVED:
            return 'Đạt';
        case statusTypes.REWORK:
            return 'Yêu cầu làm lại';
        case statusTypes.OVERDUE: 
            return 'Trễ deadline';
        case statusTypes.PENDING:
        default:
            return 'Chờ đánh giá';
    }
}

module.exports = {
    getLabelEvaluatedStatus,
}