'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('HealthPets', {
        //id: id của y tế thú cưng, tự sinh, là khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false
        },
        // pet_id: id của thú cưng, khóa ngoại, liên kết đến bảng Pet
        pet_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Pets', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        // clinic_name: tên phòng khám
        clinic_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // address: địa chỉ phòng khám
        address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        // phone: số điện thoại của phòng khám
        phone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // attending_vet: bác sĩ điều trị
        attending_vet: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('HealthPets')
  }
};
