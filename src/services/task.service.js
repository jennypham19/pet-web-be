// src/services/task.service.js
const { Task, TaskPet, Pet, User, TaskImage, sequelize } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

// lấy chi tiết 1 công việc
const getTaskById = async(id) => {
    const task = await Task.findByPk(id);
    if(!task){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Không tồn tại bản ghi,');
    }
    return task;
}

// tạo công việc
const createTask = async(taskBody) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, petIds, time, hour, frequency, otherFrequency, requiredNote, createdBy } = taskBody;
        const taskDB = await Task.create({
            name, time, hour, frequency, other_frequency: otherFrequency, required_note: requiredNote, created_by: createdBy
        }, { transaction });
        for(const petId of petIds){
            await TaskPet.create({
                task_id: taskDB.id,
                pet_id: petId
            }, { transaction })
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Lấy ra danh sách công việc
const queryTasks = async(queryOptions) => {
    try {
        const { page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if(searchTerm){
            whereClause.name =  { [Op.iLike]: `%${searchTerm}%` }
        };
        const { count, rows: tasksDB } = await Task.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: TaskPet,
                    as: 'task',
                    include: [{
                        model: Pet,
                        as: 'petsTask'
                    }]
                },
                {
                    model: User,
                    as: 'createdBy'
                }
            ],  
            limit,
            offset,
            order: [[ 'createdAt', 'DESC' ]],
            distinct: true
        });
        const totalPages = Math.ceil(count/limit);
        const tasks = tasksDB.map((task) => {
            const newTask = task.toJSON();
            return{
                id: newTask.id,
                name: newTask.name,
                time: newTask.time,
                hour: newTask.hour,
                frequency: newTask.frequency,
                otherFrequency: newTask.other_frequency ? newTask.other_frequency : null,
                requiredNote: newTask.required_note,
                manager: {
                    name: newTask.createdBy.name,
                    role: newTask.createdBy.role,
                    phone: newTask.createdBy.phone
                },
                status: newTask.status,
                isUpdatedImage: newTask.is_updated_image,
                finishedDate: newTask.finished_date,
                pets: (newTask.task ?? [])
                    .map((el) => {
                        const pet = el.petsTask;
                        return {
                            name: pet.name,
                            sex: pet.sex,
                            urlAvatar: pet.url_avatar
                        }
                    })
            }
        })
        return {
            data: tasks,
            totalPages,
            currentPage: page,
            total: count
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// Lấy ra danh sách công việc
const queryTask = async(id) => {
    try {
        const taskDB = await Task.findOne({
            where: { id },
            include: [
                {
                    model: TaskPet,
                    as: 'task',
                    include: [{
                        model: Pet,
                        as: 'petsTask'
                    }]
                },
                {
                    model: User,
                    as: 'createdBy'
                },
                {
                    model: TaskImage,
                    as: 'taskImages',
                    include: [{
                        model: User,
                        as: 'uploadedBy'
                    }]
                }
            ],
            order: [[ 'createdAt', 'DESC' ]],
            distinct: true
        });
        const newTask = taskDB.toJSON();
        const task = {
            id: newTask.id,
            name: newTask.name,
            time: newTask.time,
            hour: newTask.hour,
            frequency: newTask.frequency,
            otherFrequency: newTask.other_frequency ? newTask.other_frequency : null,
            requiredNote: newTask.required_note,
            manager: {
                name: newTask.createdBy.name,
                role: newTask.createdBy.role,
                phone: newTask.createdBy.phone
            },
            status: newTask.status,
            isUpdatedImage: newTask.is_updated_image,
            finishedDate: newTask.finished_date,
            pets: (newTask.task ?? [])
                .map((el) => {
                const pet = el.petsTask;
                    return {
                        id: pet.id,
                        name: pet.name,
                        sex: pet.sex,
                        dob: pet.dob,
                        species: pet.species,
                        type: pet.type,
                        breedingStatus: pet.breeding_status,
                        createdAt: pet.createdAt,
                        updatedAt: pet.updatedAt,
                        nameAvatar: pet.name_avatar,
                        urlAvatar: pet.url_avatar
                    }
                }),
            images: (newTask.taskImages ?? [])
                .map((img) => {
                    return {
                        id: img.id,
                        nameImage: img.name_image,
                        urlImage: img.url_image,
                        uploadedDate: img.uploaded_date,
                        createdAt: img.createdAt,
                        updatedAt: img.updatedAt,
                        uploadedBy: img.uploadedBy.name
                    }
                })
        }
        return task
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

//cập nhật trạng thái
const updatedStatus = async(id, payload) => {
    try {
        const { status, finishedDate, type } = payload;
        const task = await getTaskById(id);
        if(type === 'start'){
            task.finished_date = null
        }
        if(type === 'completed'){
            task.finished_date = finishedDate
        }
        task.status = status,
        await task.save()
    } catch (error) {
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

// cập nhật hình ảnh cho công việc
const updateImagesForTask = async(id, imagesPayload) => {
    const transaction = await sequelize.transaction();
    try {
        const { images, uploadedBy} = imagesPayload;
        const task = await getTaskById(id);
        for(const image of images){
            await TaskImage.create({
                task_id: task.id,
                name_image: image.nameImage,
                url_image: image.urlImage,
                uploaded_date: image.uploadedDate,
                uploaded_by: uploadedBy
            }, { transaction })
        }
        
        task.is_updated_image = true;
        await task.save({ transaction })

        await transaction.commit()
    } catch (error) {
        await transaction.rollback();
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

module.exports = {
    createTask,
    queryTasks,
    updatedStatus,
    updateImagesForTask,
    queryTask
}