// src/services/user.service.js
const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const crypto = require('crypto')

// Lấy chi tiết user theo id
const getUserById = async(id) => {
    const user = await User.findByPk(id);
    if(!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tồn tại người dùng. ');
    };
    return user;
}

// Kiểm tra xem có tồn tại account không
const isAccountTaken = async(account) => {
    const user = await User.findOne({ where: { account }});
    return !!user;
}

// Tạo tài khoản nhân sự
const createAccount = async(accountBody) => {
    try {
        const { name, account, password, role } = accountBody;
        if(await isAccountTaken(account)){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Tài khoản đã tồn tại.");
        }

        // Hash bằng bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, account, password: hashedPassword, role
        });
        user.password = undefined; // Không trả về password
        return user;
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra. ' + error.message)
    }
}

// Lấy danh sách tài khoản
const queryAccounts = async(queryOptions) => {
    try {
        const { page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const whereClause = { is_actived: 1 };
        if(searchTerm){
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` }},
                { account: { [Op.iLike]: `%${searchTerm}%` }},
                { phone: { [Op.iLike]: `%${searchTerm}%` }},
            ]
        }

        const { count, rows: accountsDB } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[ 'createdAt', 'DESC']]
        })

        if(accountsDB.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tồn tại bản ghi nào.')
        }
        const totalPages = Math.ceil(count/limit);
        const accounts = accountsDB.map((account) => {
            const newAccount = account.toJSON();
            return {
                id: newAccount.id,
                name: newAccount.name,
                account: newAccount.account,
                role: newAccount.role,
                gender: newAccount.gender ? newAccount.gender : null,
                position: newAccount.position ? newAccount.position : null,
                title: newAccount.title ? newAccount : null,
                dob: newAccount.dob ? newAccount.dob : null,
                cccd: newAccount.cccd ? newAccount.cccd : null,
                email: newAccount.email ? newAccount.email : null,
                phone: newAccount.phone ? newAccount.phone : null,
                address: newAccount.address ? newAccount.address : null,
                isActived: newAccount.is_actived,
                isDefaultType: newAccount.is_default_type,
                isReset: newAccount.is_reset,
                isDeleted: newAccount.is_deleted,
                avatarUrl: newAccount.avatar_url ? newAccount.avatar_url : null,
                createdAt: newAccount.createdAt,
                updatedAt: newAccount.updatedAt,
                professionalBiography: newAccount.professional_biography ? newAccount.professional_biography : null
            }
        })
        return {
            data: accounts,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Lấy danh sách tất cả tài khoản
const queryListAccounts = async(queryOptions) => {
    try {
        const { page, limit, searchTerm } = queryOptions;
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 10;
        const offset = (pageNumber - 1) * pageSize;
        
        const whereClause = { };
        if(searchTerm){
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` }},
                { account: { [Op.iLike]: `%${searchTerm}%` }},
                { phone: { [Op.iLike]: `%${searchTerm}%` }},
            ]
        }

        const { count, rows: accountsDB } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[ 'createdAt', 'DESC']]
        })

        if(accountsDB.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tồn tại bản ghi nào.')
        }
        const totalPages = Math.ceil(count/limit);
        const accounts = accountsDB.map((account) => {
            const newAccount = account.toJSON();
            return {
                id: newAccount.id,
                name: newAccount.name,
                account: newAccount.account,
                role: newAccount.role,
                gender: newAccount.gender ? newAccount.gender : null,
                position: newAccount.position ? newAccount.position : null,
                title: newAccount.title ? newAccount.title : null,
                dob: newAccount.dob ? newAccount.dob : null,
                cccd: newAccount.cccd ? newAccount.cccd : null,
                email: newAccount.email ? newAccount.email : null,
                phone: newAccount.phone ? newAccount.phone : null,
                address: newAccount.address ? newAccount.address : null,
                isActived: newAccount.is_actived,
                isDefaultType: newAccount.is_default_type,
                isReset: newAccount.is_reset,
                isDeleted: newAccount.is_deleted,
                avatarUrl: newAccount.avatar_url ? newAccount.avatar_url : null,
                createdAt: newAccount.createdAt,
                updatedAt: newAccount.updatedAt,
                professionalBiography: newAccount.professional_biography ? newAccount.professional_biography : null
            }
        })
        return {
            data: accounts,
            totalPages,
            currentPage: page,
            total: count,
            limit: pageSize
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}


// Lấy chi tiết tài khoản
const getAccount = async(id) => {
    try {
        const accountDB = await User.findOne({
            where: { id },
            order: [[ 'createdAt', 'DESC']]
        })
        const newAccount = accountDB.toJSON();
        const account =  {
                id: newAccount.id,
                name: newAccount.name,
                account: newAccount.account,
                role: newAccount.role,
                gender: newAccount.gender ? newAccount.gender : null,
                position: newAccount.position ? newAccount.position : null,
                title: newAccount.title ? newAccount : null,
                dob: newAccount.dob ? newAccount.dob : null,
                cccd: newAccount.cccd ? newAccount.cccd : null,
                email: newAccount.email ? newAccount.email : null,
                phone: newAccount.phone ? newAccount.phone : null,
                address: newAccount.address ? newAccount.address : null,
                isActived: newAccount.is_actived,
                isDefaultType: newAccount.is_default_type,
                isReset: newAccount.is_reset,
                isDeleted: newAccount.is_deleted,
                avatarUrl: newAccount.avatar_url ? newAccount.avatar_url : null,
                createdAt: newAccount.createdAt,
                updatedAt: newAccount.updatedAt,
                professionalBiography: newAccount.professional_biography ? newAccount.professional_biography : null
            }

        return account
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    } 
}

// Cập nhật hồ sơ thông tin
const updateProfile = async(id, profileBody) => {
    try {
        const { avatarUrl, name, gender, dob, cccd, position, title, professionalBiography, email, phone, address } = profileBody;
        const userDB = await getUserById(id);
        await userDB.update({
            avatar_url: avatarUrl, name, gender, date_of_birth: dob, cccd, position, title, professional_biography: professionalBiography, email, phone, address
        })
        const newUser = userDB.toJSON();
        const user = {
                id: newUser.id,
                name: newUser.name,
                account: newUser.account,
                password: newUser.password,
                gender: newUser.gender,
                position: newUser.position,
                title: newUser.title,
                dob: newUser.date_of_birth,
                cccd: newUser.cccd,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                isActived: newUser.is_actived,
                isDefaultType: newUser.is_default_type,
                isReset: newUser.is_reset,
                isDeleted: newUser.is_deleted,
                avatarUrl: newUser.avatar_url,
                role: newUser.role,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
                professionalBiography: newUser.professional_biography ? newUser.professional_biography : null
            
        };
        return user;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// kích hoạt lại tài khoản
const activateAccount = async(id) => {
    try { 
        const userDB = await getUserById(id);
        await userDB.update({ is_actived: 1 });
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi kích hoạt tài khoản: " + error.message)
    }
}

// vô hiệu hóa tài khoản
const deactivateAccount = async(id) => {
    try {
        const userDB = await getUserById(id);
        await userDB.update({ is_actived: -1 });
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi vô hiệu hóa tài khoản: " + error.message)
    }
}

// thay đổi mật khẩu 
const changePassword = async(id, passwordBody) => {
    try {
        const { password, currentPassword } = passwordBody;
        const accountDB = await getUserById(id);
        if(!(await bcrypt.compare(currentPassword, accountDB.password))){
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Mật khẩu hiện tại không chính xác');
        }
        // Hash bằng bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // update DB
        await accountDB.update({
            password: hashedPassword,
            is_default_type: -1
        });
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi đổi mật khẩu: " + error.message)
    }
}

// thay đổi role
const changeRoleAccount = async(id, roleBody) => {
    try {
        const accountDB = await getUserById(id);
        // update role
        await accountDB.update({
            role: roleBody.role,
        })
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi thay đổi vai trò: " + error.message)
    }
}

// Reset mật khẩu
const resetPasswordAccount = async(id) => {
  const user = await getUserById(id);

  // Tự sinh password ngẫu nhiên dài 6 ký tự
  const plainPassword = crypto.randomBytes(6).toString('base64').slice(0,6);

  // Hash bằng bcrypt
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  await user.update({ password: hashedPassword, is_reset: true });

  user.password = undefined; // Không trả về password
  const newUser = user.toJSON();
  const userReturn = {
    name: newUser.name,
    account: newUser.account,
    password: plainPassword
  }

  return userReturn;
}
module.exports = {
    createAccount,
    queryAccounts,
    getAccount,
    updateProfile,
    activateAccount,
    deactivateAccount,
    queryListAccounts,
    changePassword,
    changeRoleAccount,
    resetPasswordAccount
}