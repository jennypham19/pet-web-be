'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('RegularVetCheckups');
    if(tableDescription.health_condition){
      await queryInterface.changeColumn('RegularVetCheckups', 'health_condition', {
        type: Sequelize.TEXT,
        allowNull: true
      })
    };
    if(tableDescription.conclusion){
      await queryInterface.changeColumn('RegularVetCheckups', 'conclusion', {
        type: Sequelize.TEXT,
        allowNull: true
      })
    };
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('RegularVetCheckups', 'health_condition', {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.changeColumn('RegularVetCheckups', 'conclusion', {
      type: Sequelize.TEXT,
      allowNull: false
    })
  }
};
