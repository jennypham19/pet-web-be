'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Tasks');
    if(!tableDescription.is_updated_image){
      await queryInterface.addColumn('Tasks', 'is_updated_image', {
        // is_updated_image: cập nhật trạng thái đã upload ảnh chưa
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Tasks', 'is_updated_image');
  }
};
