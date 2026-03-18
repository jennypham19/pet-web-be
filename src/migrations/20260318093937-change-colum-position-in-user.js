'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Users');
    if(tableDescription.position){
      await queryInterface.changeColumn('Users', 'position', {
        type: Sequelize.STRING,
        allowNull: true
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'position', {
      type: Sequelize.STRING,
      allowNull: false
    })
  }
};
