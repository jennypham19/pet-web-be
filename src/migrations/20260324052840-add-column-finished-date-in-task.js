'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Tasks');
    if(!tableDescription.finished_date){
      await queryInterface.addColumn('Tasks', 'finished_date', {
        type: Sequelize.DATE,
        allowNull: true
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'finished_date')
  }
};
