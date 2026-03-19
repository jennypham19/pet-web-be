'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Pets');
    if(!tableDescription.name_avatar){
      await queryInterface.addColumn('Pets', 'name_avatar', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }
    if(!tableDescription.url_avatar) {
      await queryInterface.addColumn('Pets', 'url_avatar', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Pets', 'name_avatar');
    await queryInterface.removeColumn('Pets', 'url_avatar');
  }
};
