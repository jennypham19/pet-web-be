'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Tasks');
    if(!tableDescription.status){
      await queryInterface.addColumn('Tasks', 'status', {
        // status: trạng thái của công việc
        type: Sequelize.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending'
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Tasks_status";');
  }
};
