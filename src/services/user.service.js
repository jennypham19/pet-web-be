// src/services/user.service.js
const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

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
        const whereClause = {};
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
                updatedAt: newAccount.updatedAt
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
                updatedAt: newAccount.updatedAt
            }

        return account
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    } 
}
module.exports = {
    createAccount,
    queryAccounts,
    getAccount
}