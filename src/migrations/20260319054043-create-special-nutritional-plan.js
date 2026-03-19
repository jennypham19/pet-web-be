'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('SpecialNutritionalPlans', {
        //id: id của chế độ dinh dưỡng đặc biệt, tự sinh, là khóa chính
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
        // food: thức ăn
        food: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // amount: số lượng
        amount: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // frequency: tần suất
        frequency: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // nutritional_supplements: bổ sung thêm dinh dưỡng
        nutritional_supplements: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAT: { type: Sequelize.DATE, allowNull: false }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('SpecialNutritionalPlans')
  }
};
