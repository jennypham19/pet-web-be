// src/services/task.service.js
const { Task, TaskPet, Pet, User, TaskImage, sequelize } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { Op, where } = require('sequelize');
const { defaults } = require('joi');

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
        const hourDate = new Date(hour); // ✅ convert tại đây
        if (isNaN(hourDate.getTime())) {
            throw new Error("hour không hợp lệ");
        }
        const dueDate = new Date(hourDate);
        dueDate.setHours(23, 59, 59, 999); // ✅ cuối ngày
        const taskDB = await Task.create({
            name, time, hour, frequency, other_frequency: otherFrequency, required_note: requiredNote, created_by: createdBy, due_date: dueDate
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
                dueDate: newTask.due_date,
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

// Lấy ra danh sách công việc cho chuyên viên
const queryTasksForSpecialist = async(queryOptions) => {
    try {
        const { page, limit, searchTerm } = queryOptions;
        const offset = (page - 1) * limit;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const whereClause = {
            due_date: {
                [Op.between]: [startOfDay, endOfDay]
            }
        };
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
                dueDate: newTask.due_date,
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

// lặp lại công việc đã được tạo cho ngày mai
const rolloverOrRecreateTasksForToday = async(targetDateString) => {
    const transaction = await sequelize.transaction();
    try {
        const previousDate = new Date(targetDateString);
        previousDate.setDate(previousDate.getDate() - 1);
        const previousDateString = previousDate.toISOString().split('T')[0];

        // Lấy Tasks + id Pet của ngày hôm qua
        const tasksFromPreviousDay = await Task.findAll({
            where: {
                due_date: previousDateString,
            },
            include: [{ model: TaskPet, as: 'task' }],
            transaction
        });
        if(!tasksFromPreviousDay || tasksFromPreviousDay.length === 0){
            // Xử lý trường hợp không có công việc nào từ ngày hôm qua
            await transaction.commit();
            return { createdCount: 0, alreadyExistedOrSkippedCount: 0, totalProcessedFromPreviousDay: 0 }
        }
        let createdCount = 0;
        let alreadyExistedOrSkippedCount = 0;

        for(const preTaskInstance of tasksFromPreviousDay){
            const preTask = preTaskInstance.toJSON();
            // ✅ Convert về Date
            const hourDate = new Date(preTask.hour);

            // ✅ Tăng 1 ngày (giữ nguyên giờ)
            const nextDayHour = new Date(hourDate);
            nextDayHour.setDate(nextDayHour.getDate() + 1);

            // ✅ Tính due_date = cuối ngày của ngày mới
            const dueDate = new Date(nextDayHour);
            dueDate.setHours(23, 59, 59, 999);

            const newTaskDataDefaults = {
                name: preTask.name,
                time: preTask.time,
                hour: nextDayHour, // Giữ nguyên giờ và đổi ngày
                frequency: preTask.frequency,
                other_frequency: preTask.other_frequency ? preTask.other_frequency : null,
                required_note: preTask.required_note,
                created_by: preTask.created_by,
                status: 'pending',
                is_updated_image: false,
                finished_date: null,
                due_date: dueDate // Đặt thời gian đến hạn là cuối ngày
            }

            const [task, taskCreated] = await Task.findOrCreate({
                where: {
                    name: newTaskDataDefaults.name,
                    due_date: dueDate
                },
                defaults: newTaskDataDefaults,
                transaction,
            })

            if(taskCreated) createTask++;
            else alreadyExistedOrSkippedCount++;

            // Sao chép mối quan hệ với Pet nếu Task mới được tạo
            for(const taskPet of preTask.task){
                const prePetId = taskPet.toJSON();
                const newPetTaskDefaults = {
                    task_id: task.id,
                    pet_id: prePetId.pet_id
                };

                // Sử dụng findOrCreate để tránh tạo trùng nếu cron chạy lại
                const [petTask, petTaskCreated] = await TaskPet.findOrCreate({
                    where: {
                        task_id: newPetTaskDefaults.task_id,
                        pet_id: newPetTaskDefaults.pet_id
                    },
                    defaults: newPetTaskDefaults,
                    transaction
                });

                if(petTaskCreated) createdCount++;
                else alreadyExistedOrSkippedCount++;
            }
        }
        await transaction.commit();
        return { createdCount, alreadyExistedOrSkippedCount, totalProcessedFromPreviousDay: tasksFromPreviousDay.length }
    } catch (error) {
        await transaction.rollback();
        if(error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}

const deleteOldTasks = async(daysToKeep = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffDateString = cutoffDate.toISOString().split('T')[0];
        const result = await Task.destroy({
            where: {
                due_date: {
                    [Op.lt]: cutoffDateString
                }
            }
        });
        return { deletedCount: result }
    } catch (error) {
        throw error
    }
}
module.exports = {
    createTask,
    queryTasks,
    updatedStatus,
    updateImagesForTask,
    queryTask,
    rolloverOrRecreateTasksForToday,
    deleteOldTasks,
    queryTasksForSpecialist
}