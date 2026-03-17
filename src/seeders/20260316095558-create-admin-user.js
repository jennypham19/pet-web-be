'use strict';
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableName = 'Users';
    const adminAccount = 'admin';
    const existingAccount = await queryInterface.sequelize.query(
      `SELECT account from "${tableName}" WHERE account = :account LIMIT 1`,
      {
        replacements: { account: adminAccount},
        type: Sequelize.QueryTypes.SELECT,
        plain: true
      }
    );

    if(!existingAccount) {
      // Băm mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);

      await queryInterface.bulkInsert(tableName, [{
        id: uuidv4(),
        name: 'Quản trị viên',
        account: adminAccount,
        password: hashedPassword,
        role: 'admin',
        gender: null,
        position: 'Quabr trị viên cấp cao',
        title: null,
        date_of_birth: null,
        cccd: null,
        email: 'admin@gmail.com',
        phone: '0975814784',
        address: null,
        avatar_url: null,
        is_actived: 1,
        is_default_type: 1,
        is_reset: false,
        is_deleted: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log(`Successfully inserted initial admin user: '${adminAccount}'`);
    } else{
      console.log(`Initial admin user '${adminAccount}' already exists. Skipping.`);
    }
  },

  async down (queryInterface, Sequelize) {
    // Giữ nguyên logic down, nó đã đúng
    await queryInterface.bulkDelete('Users', { account: 'admin' });
    console.log(`Successfully deleted initial account user: 'admin'`);
  }
};
