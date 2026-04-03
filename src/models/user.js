// src/models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model{
        static associate(models){
            User.hasMany(models.Task, {
                foreignKey: 'created_by',
                as: 'createdByTask'
            }),
            User.hasMany(models.TaskImage, {
                foreignKey: 'uploaded_by',
                as: 'uploadedByTaskImage'
            })
        }
    };

    User.init({
        // Cột id: id của người dùng, tự sinh, là khóa chính
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, // dùng thư viện uuid => uuidv4 hoặc Sequelize tự sinh UUID (v4): DataTypes.UUIDV4
            primaryKey: true,
            allowNull: false
        },
        // Cột name: tên người dùng
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Cột account: tài khoản của người dùng
        account: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Cột password: mật khẩu tài khoản của người dùng
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Cột role: vai trò
        /* Các vai trò
            1. Mod 1: Có chức năng tạo công việc, update thông tin thú cưng, thông tin cá nhân
            2. Mod 2: Chăm sóc và cập nhật thú cưng
            3. Mod 3: Chụp ảnh thú cưng
        */
        role: {
            type: DataTypes.ENUM('admin', 'mod', 'specialist', 'employee'),
            allowNull: false
        },
        // Cột gender: giới tính
        gender: {
            type: DataTypes.ENUM('male', 'female', 'others'),
            allowNull: true
        },
        // Cột position: vị trí
        position: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Cột title: chức danh
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Cột date_of_birth: ngày sinh
        date_of_birth: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Cột cccd: căn cước công dân
        cccd: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Cột email: email
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Cột phone: số điện thoại
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Cột address: địa chỉ
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Cột avatar_url: hình ảnh chân dung
        avatar_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Cột is_actived: 
        is_actived: {
            type: DataTypes.INTEGER,
            defaultValue: 1 // 1: đã active, -1: bị vô hiệu hóa
        },
        // Cột is_default_type: tài khoản mặc định
        is_default_type: {
            type: DataTypes.INTEGER,
            defaultValue: 1 // 1: mặc định, 1: đã bị reset mật khẩu
        },
        // Cột is_reset: reset mật khẩu
        is_reset: {
            type: DataTypes.BOOLEAN,
            defaultValue: false // T: đã bị reset, F: không bị reset
        },
        // Cột is_deleted: xóa user
        is_deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 1 // 1: khôn xóa, -1: đã xóa
        },
        professional_biography: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'User'
    });

    return User;
}
