'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Tasks');
    if (!tableDescription.due_date) {
      await queryInterface.addColumn('Tasks', 'due_date', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'due_date');
  }
};
