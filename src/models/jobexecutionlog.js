'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobExecutionLog extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  JobExecutionLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // dùng thư viện uuid => uuidv4 hoặc Sequelize tự sinh UUID (v4): DataTypes.UUIDV4
      primaryKey: true,
      allowNull: false
    },
    job_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    run_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'JobExecutionLog',
    tableName: 'JobExecutionLogs' // Đảm bảo khớp với createTable
  });
  return JobExecutionLog;
};