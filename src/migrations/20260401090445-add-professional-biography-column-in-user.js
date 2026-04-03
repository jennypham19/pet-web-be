'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Users');
    if(!tableDescription.professional_biography){
      await queryInterface.addColumn('Users', 'professional_biography', {
        type: Sequelize.TEXT,
        allowNull: true
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'professional_biography')
  }
};
