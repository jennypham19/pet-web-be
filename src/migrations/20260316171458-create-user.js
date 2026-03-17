'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // bật extension pgcrypto nếu chưa có (để tạo UUID)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryInterface.createTable('Users', {
      // id: id của người dùng, tự sinh
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'), // Nếu dùng PostgreSQL, tạo UUID bằng pgcrypto
        // hoặc với MySQL: Sequelize.literal('(UUID())')
        primaryKey: true,
        allowNull: false
      },
        // Cột name: tên người dùng
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // Cột account: tài khoản của người dùng
        account: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // Cột password: mật khẩu tài khoản của người dùng
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // Cột role: vai trò
        /* Các vai trò
            1. Mod 1: Có chức năng tạo công việc, update thông tin thú cưng, thông tin cá nhân
            2. Mod 2: Chăm sóc và cập nhật thú cưng
            3. Mod 3: Chụp ảnh thú cưng
        */
        role: {
            type: Sequelize.ENUM('admin', 'mod', 'specialist', 'employee'),
            allowNull: false
        },
        // Cột gender: giới tính
        gender: {
            type: Sequelize.ENUM('male', 'female', 'others'),
            allowNull: true
        },
        // Cột position: vị trí
        position: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // Cột title: chức danh
        title: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // Cột date_of_birth: ngày sinh
        date_of_birth: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // Cột cccd: căn cước công dân
        cccd: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // Cột email: email
        email: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // Cột phone: số điện thoại
        phone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        // Cột address: địa chỉ
        address: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        // Cột avatar_url: hình ảnh chân dung
        avatar_url: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        // Cột is_actived: 
        is_actived: {
            type: Sequelize.INTEGER,
            defaultValue: 1 // 1: đã active, -1: bị vô hiệu hóa
        },
        // Cột is_default_type: tài khoản mặc định
        is_default_type: {
            type: Sequelize.INTEGER,
            defaultValue: 1 // 1: mặc định, -1: đã bị reset mật khẩu
        },
        // Cột is_reset: reset mật khẩu
        is_reset: {
            type: Sequelize.BOOLEAN,
            defaultValue: false // T: đã bị reset, F: không bị reset
        },
        // Cột is_deleted: xóa user
        is_deleted: {
            type: Sequelize.INTEGER,
            defaultValue: 1 // 1: khôn xóa, -1: đã xóa
        },
        // Cột createdAt: ngày tạo, kiểu ngày tháng, không null
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        // Cột updatedAt: ngày chỉnh sửa, kiểu ngày tháng, không null
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Users')
  }
};
