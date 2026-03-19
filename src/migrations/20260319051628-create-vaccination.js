'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Vaccinations', {
        //id: id của vắc xin, tự sinh, là khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false
        },
        // pet_id: id của thú cưng, là khóa ngoại liên kết với bảng Pet
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
        // first_dose_date: ngày bắt đầu tiêm
        first_dose_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        // booster_date: ngày tiêm nhắc lại
        booster_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        // adverse_reaction: kết quả phản ứng
        adverse_reaction: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Vaccinations')
  }
};
