'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Pets', {
        //id: id của thú cưng, tự sinh, là khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false
        },
        // name: tên của thú cưng
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // sex: giới tính
        sex: {
            type: Sequelize.ENUM('female', 'male'),
            allowNull: false
        },
        // dob: ngày sinh của thú cưng
        dob: {
            type: Sequelize.DATE,
            allowNull: true
        },
        // species: loài
        species: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // type: động vật
        type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // breeding_staus: tình trạng sinh sản của thú cưng
        breeding_staus:{
            type: Sequelize.TEXT,
            allowNull: false
        },
      createdAt: { type: Sequelize.DATE, allowNull: false},
      updatedAt: { type: Sequelize.DATE, allowNull: false} 
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Pets')
  }
};
