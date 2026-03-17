'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Tokens', {
      // id của user, kiểu UUID, khóa chính, không null, sự sinh UUID v4 khi tạo mới
      id: { 
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'), // Nếu dùng PostgreSQL, tạo UUID bằng pgcrypto
        // hoặc với MySQL: Sequelize.literal('(UUID())')
        primaryKey: true,
        allowNull: false
      },
      token: { type: Sequelize.STRING, allowNull: false, unique: true},
      type: { type: Sequelize.STRING, allowNull: false},
      expires: { type: Sequelize.DATE, allowNull: false},
      blacklisted: { type: Sequelize.BOOLEAN, defaultValue: false},
      // Khóa ngoại tới bảng Users
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false},
      updatedAt: { type: Sequelize.DATE, allowNull: false}
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Tokens')
  }
};
