'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Tasks');
    if (!tableDescription.task_number) {
      await queryInterface.addColumn('Tasks', 'task_number', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'task_number');
  }
};
