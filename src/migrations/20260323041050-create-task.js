'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
        // id: id của công việc, khóa chính, tự tăng
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false
        },
        // name: tên của công việc
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // time: thời điểm
        time: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // hour: thời gian
        hour: {
            type: Sequelize.DATE,
            allowNull: false
        },
        // frequency: tần suất
        frequency: {
            type: Sequelize.ENUM('everyday', 'one_time_day', 'two_times_day', 'three_times_day', 'everyweek', 'one_time_week', 'two_times_week', 'three_times_week', 'everymonth', 'others'),
            allowNull: false
        },
        // other_frequency: tần suất khác
        other_frequency: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // required_note: yêu cầu,
        required_note: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        // created_by: người tạo
        created_by: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Users', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks')
  }
};
