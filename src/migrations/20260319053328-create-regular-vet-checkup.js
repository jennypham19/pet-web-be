'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('RegularVetCheckups', {
        //id: id của khám định kỳ, tự sinh, là khóa chính
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
        // examination_date: ngày khám
        examination_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        // recheck_date: ngày khám lại
        recheck_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        // health_condition: tình trạng sức khỏe
        health_condition: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        // conclusion: kết luận
        conclusion: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('RegularVetCheckups')
  }
};
