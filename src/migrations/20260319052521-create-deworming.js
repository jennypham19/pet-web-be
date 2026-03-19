'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Dewormings', {
        //id: id của tẩy giun, tự sinh, là khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false
        },
        // pet_id: id của thú cưng, là khóa ngoại liên kết bảng Pet
        pet_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Pets', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        // medication_name: tên thuốc
        medication_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // dosage: liều lượng
        dosage: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // deworming_date: ngày tẩy giun
        deworming_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        // next_deworming_date: ngày tẩy lại
        next_deworming_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Deworming')
  }
};
