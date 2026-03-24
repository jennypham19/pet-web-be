'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('SpecialNutritionalPlans');
    if(tableDescription.food){
      await queryInterface.changeColumn('SpecialNutritionalPlans', 'food', {
        type: Sequelize.STRING,
        allowNull: true
      })
    };
    if(tableDescription.amount){
      await queryInterface.changeColumn('SpecialNutritionalPlans', 'amount', {
        type: Sequelize.STRING,
        allowNull: true
      })
    };
      if(tableDescription.nutritional_supplements){
      await queryInterface.changeColumn('SpecialNutritionalPlans', 'nutritional_supplements', {
        type: Sequelize.TEXT,
        allowNull: true
      })
    };
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('SpecialNutritionalPlans', 'food', {
      type: Sequelize.STRING,
      allowNull: false
    })
    await queryInterface.changeColumn('SpecialNutritionalPlans', 'amount', {
      type: Sequelize.STRING,
      allowNull: false
    })
    await queryInterface.changeColumn('SpecialNutritionalPlans', 'nutritional_supplements', {
      type: Sequelize.TEXT,
      allowNull: false
    })
  }
};
