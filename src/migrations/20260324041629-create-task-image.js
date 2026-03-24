'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TaskImages', {
        // id: id của taskImage, khóa chính
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            allowNull: false,
            primaryKey: true
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
        // name_image: tên của ảnh
        name_image: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // url_image: đường link của ảnh
        url_image: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // uploaded_date: ngày giờ chụp ảnh
        uploaded_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        // uploaded_by: người chụp
        uploaded_by: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'Users', key: 'id'
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
    await queryInterface.dropTable('TaskImages')
  }
};
