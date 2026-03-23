'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TaskPets', {
        // id: id của task-pet, khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            allowNull: false
        },
        // task_id: id của Task, khóa phụ
        task_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Tasks', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        // pet_id: id của Pet, khóa phụ
        pet_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Pets', key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
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
    await queryInterface.dropTable('TaskPets')
  }
};
