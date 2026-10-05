// src/services/task.service.js
const { Task, TaskPet, Pet, User, TaskImage, sequelize } = require('../models');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');
const { DateTime } = require('luxon');
const { lock } = require('../routes/task.route');
const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');
const notificationService = require('./notification.service.js');

// Trích public_id + resource_type từ URL Cloudinary để phục vụ việc xóa ảnh
const parseCloudinaryUrl = (url) => {
    try {
        if (!url) return null;
        // Xác định resource_type từ path: /image/upload, /video/upload, /raw/upload
        let resourceType = 'image';
        const resourceMatch = url.match(/\/(image|video|raw)\/upload\//);
        if (resourceMatch) {
            resourceType = resourceMatch[1];
        }
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return null;
        let rest = url.substring(uploadIndex + '/upload/'.length);
        // Bỏ version "v1234567890/" nếu có
        rest = rest.replace(/^v\d+\//, '');
        // Bỏ query string nếu có
        rest = rest.split('?')[0];
        // Bỏ phần mở rộng file (.jpg, .png...)
        const lastDot = rest.lastIndexOf('.');
        if (lastDot !== -1) {
            rest = rest.substring(0, lastDot);
        }
        return { publicId: decodeURIComponent(rest), resourceType };
    } catch (e) {
        return null;
    }
};

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
        // ✅ ======== 1.Parse hour theo timezone VN ===========
        const hourDate = DateTime.fromISO(hour, { zone: 'Asia/Ho_Chi_Minh' });
        if (!hourDate.isValid) {
            throw new Error("hour không hợp lệ");
        }
        // ✅ ======== 2. End of day theo VN ===========
        const dueDate = hourDate.endOf('day').toJSDate();

        // ======= 3. Lấy task lớn nhất trong ngày để xác định task_number cho task mới ===========
        const lastTaskOfTheDay = await Task.findOne({
            where: {
                due_date: dueDate,
            },
            order: [['task_number', 'DESC']],
            transaction,
            lock: transaction.LOCK.UPDATE // Đặt lock để tránh race condition
        });

        const nextTaskNumber = lastTaskOfTheDay ? (lastTaskOfTheDay.task_number || 0) + 1 : 1;

        // ======= 4. Tạo task mới với transaction ===========
        const taskDB = await Task.create({
            name, time, task_number: nextTaskNumber,
            hour: hourDate, // Lưu giờ theo timezone VN, Sequelize sẽ tự động chuyển sang UTC khi lưu vào DB 
            frequency, other_frequency: otherFrequency, required_note: requiredNote, created_by: createdBy, due_date: dueDate
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
            order: [
                [ 'hour', 'ASC' ],
                [ 'task_number', 'ASC']
            ],
            distinct: true
        });
        const totalPages = Math.ceil(count/limit);
        const tasks = tasksDB.map((task) => {
            const newTask = task.toJSON();
            return{
                id: newTask.id,
                name: newTask.name,
                taskNumber: newTask.task_number,
                displayName: `${newTask.task_number}. ${newTask.name}`,
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
// const queryTasksForSpecialist = async(queryOptions) => {
//     try {
//         const { page, limit, searchTerm } = queryOptions;
//         const offset = (page - 1) * limit;

//         // ✅ Lấy giờ theo timezone VN
//         const todayStr = new Date().toLocaleString('en-US', {
//             timeZone: 'Asia/Ho_Chi_Minh'
//         });
//         const date = new Date(todayStr);

//         // ✅ Tính start & end của hôm nay
//         const startOfDay = new Date(date);
//         startOfDay.setHours(0, 0, 0, 0);

//         const endOfDay = new Date(date);
//         endOfDay.setHours(23, 59, 59, 999);
        
//         const whereClause = {
//             due_date: {
//                 [Op.between]: [startOfDay, endOfDay]
//             }
//         };
//         if(searchTerm){
//             whereClause.name =  { [Op.iLike]: `%${searchTerm}%` }
//         };
//         const { count, rows: tasksDB } = await Task.findAndCountAll({
//             where: whereClause,
//             include: [
//                 {
//                     model: TaskPet,
//                     as: 'task',
//                     include: [{
//                         model: Pet,
//                         as: 'petsTask'
//                     }]
//                 },
//                 {
//                     model: User,
//                     as: 'createdBy'
//                 }
//             ],  
//             limit,
//             offset,
//             order: [[ 'createdAt', 'ASC' ]],
//             distinct: true
//         });
//         const totalPages = Math.ceil(count/limit);
//         const tasks = tasksDB.map((task) => {
//             const newTask = task.toJSON();
//             return{
//                 id: newTask.id,
//                 name: newTask.name,
//                 taskNumber: newTask.task_number,
//                 displayName: `${newTask.task_number}. ${newTask.name}`,
//                 time: newTask.time,
//                 hour: newTask.hour,
//                 frequency: newTask.frequency,
//                 otherFrequency: newTask.other_frequency ? newTask.other_frequency : null,
//                 requiredNote: newTask.required_note,
//                 manager: {
//                     name: newTask.createdBy.name,
//                     role: newTask.createdBy.role,
//                     phone: newTask.createdBy.phone
//                 },
//                 status: newTask.status,
//                 isUpdatedImage: newTask.is_updated_image,
//                 finishedDate: newTask.finished_date,
//                 dueDate: newTask.due_date,
//                 pets: (newTask.task ?? [])
//                     .map((el) => {
//                         const pet = el.petsTask;
//                         return {
//                             name: pet.name,
//                             sex: pet.sex,
//                             urlAvatar: pet.url_avatar
//                         }
//                     })
//             }
//         })
//         return {
//             data: tasks,
//             totalPages,
//             currentPage: page,
//             total: count
//         }
//     } catch (error) {
//         throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
//     }
// }

const queryTasksForSpecialist = async(queryOptions) => {
    try {
        const { page, limit, selectedDate } = queryOptions;
        const offset = (page - 1) * limit;

        // ==================================================
        // Nếu FE gửi ngày chọn -> dùng ngày đó
        // Không gửi -> lấy ngày hiện tại
        // ==================================================
        const rawDate = selectedDate
            ? new Date(selectedDate)
            : new Date();

        // ✅ Lấy giờ theo timezone VN
        const todayStr = rawDate.toLocaleString('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh'
        });

        const date = new Date(todayStr);

        // ✅ Tính start & end của hôm nay
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const whereClause = {
            due_date: {
                [Op.between]: [startOfDay, endOfDay]
            }
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
            order: [[ 'createdAt', 'ASC' ]],
            distinct: true
        });
        const totalPages = Math.ceil(count/limit);
        const tasks = tasksDB.map((task) => {
            const newTask = task.toJSON();
            return{
                id: newTask.id,
                name: newTask.name,
                taskNumber: newTask.task_number,
                displayName: `${newTask.task_number}. ${newTask.name}`,
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
        // const previousDate = new Date(targetDateString);
        // previousDate.setDate(previousDate.getDate() - 1);
        // const previousDateString = previousDate.toLocaleDateString('en-CA', {
        //     timeZone: 'Asia/Ho_Chi_Minh'
        // });

        // const startOfDay = new Date(previousDateString + 'T00:00:00.000+07:00');
        // const endOfDay = new Date(previousDateString + 'T23:59:59.999+07:00');

        // ✅ Ngày hôm qua theo VN
        const targetDate = DateTime.fromISO(targetDateString, {
            zone: 'Asia/Ho_Chi_Minh'
        });

        const previousDate = targetDate.minus({ days: 1 });

        const startOfDay = previousDate.startOf('day').toJSDate();
        const endOfDay = previousDate.endOf('day').toJSDate();

        // Lấy Tasks + id Pet của ngày hôm qua
        let tasksFromPreviousDay = await Task.findAll({
            where: {
                due_date: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: [{ model: TaskPet, as: 'task' }],
            transaction
        });

        // ✅ Nếu ngày hôm qua không có task nào, lùi về tìm ngày gần nhất trước đó có task
        // để lấy toàn bộ công việc của ngày đó làm mẫu lặp lại cho hôm nay
        if(!tasksFromPreviousDay || tasksFromPreviousDay.length === 0){
            const latestPreviousTask = await Task.findOne({
                where: {
                    due_date: { [Op.lt]: startOfDay }
                },
                order: [['due_date', 'DESC']],
                transaction
            });

            if(latestPreviousTask){
                const latestPreviousDate = DateTime.fromJSDate(latestPreviousTask.due_date, {
                    zone: 'Asia/Ho_Chi_Minh'
                });
                const latestStartOfDay = latestPreviousDate.startOf('day').toJSDate();
                const latestEndOfDay = latestPreviousDate.endOf('day').toJSDate();

                tasksFromPreviousDay = await Task.findAll({
                    where: {
                        due_date: {
                            [Op.between]: [latestStartOfDay, latestEndOfDay]
                        }
                    },
                    include: [{ model: TaskPet, as: 'task' }],
                    transaction
                });
            }
        }

        if(!tasksFromPreviousDay || tasksFromPreviousDay.length === 0){
            // Không tìm thấy công việc nào trong lịch sử để lặp lại
            await transaction.commit();
            return { createdTaskCount: 0, createdTaskPetCount: 0, alreadyExistedOrSkippedCount: 0, totalProcessedFromPreviousDay: 0 }
        }
        let createdTaskCount = 0;
        let createdTaskPetCount = 0;
        let alreadyExistedOrSkippedCount = 0;

        for(const preTaskInstance of tasksFromPreviousDay){
            const preTask = preTaskInstance.toJSON();
            // // ✅ Convert về Date
            // const hourDate = new Date(preTask.hour);

            // // ✅ Tăng 1 ngày (giữ nguyên giờ)
            // const nextDayHour = new Date(hourDate);
            // nextDayHour.setDate(nextDayHour.getDate() + 1);

            // // ✅ Tính due_date = cuối ngày của ngày mới
            // const dueDate = new Date(nextDayHour);
            // dueDate.setHours(23, 59, 59, 999);

            // ✅ Convert hour về VN
            const hourDate = DateTime.fromJSDate(new Date(preTask.hour), {
                zone: 'Asia/Ho_Chi_Minh'
            });

            // ✅ Map giờ về đúng targetDate (giữ nguyên giờ:phút:giây), vì task mẫu
            // có thể lấy từ ngày hôm qua hoặc từ ngày gần nhất trước đó có task
            const nextDayHour = targetDate.startOf('day').set({
                hour: hourDate.hour,
                minute: hourDate.minute,
                second: hourDate.second,
                millisecond: hourDate.millisecond
            });

            // ✅ due_date cuối ngày VN
            // const dueDate = nextDayHour.endOf('day');
            const startOfNewDay = nextDayHour.startOf('day').toJSDate();
            const endOfNewDay = nextDayHour.endOf('day').toJSDate();

            const dueDate = nextDayHour.endOf('day').toJSDate();

            const newTaskDataDefaults = {
                name: preTask.name,
                task_number: preTask.task_number, // Tạm thời giữ nguyên số thứ tự, sau khi tạo sẽ update lại nếu có task nào trong ngày mới
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

            const existed = await Task.findOne({
                where: {
                    name: newTaskDataDefaults.name,
                    task_number: newTaskDataDefaults.task_number,
                    created_by: newTaskDataDefaults.created_by,
                    due_date: {
                        [Op.between]: [startOfNewDay, endOfNewDay]
                    }
                },
                transaction
            });

            let task;
            if (!existed) {
                task = await Task.create(newTaskDataDefaults, { transaction });
                createdTaskCount++;
            } else {
                alreadyExistedOrSkippedCount++;
            }
            
            // Sao chép mối quan hệ với Pet nếu Task mới được tạo
            for(const taskPet of preTask.task){
                const newPetTaskDefaults = {
                    task_id: task.id,
                    pet_id: taskPet.pet_id
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

                if(petTaskCreated) createdTaskPetCount++;
                else alreadyExistedOrSkippedCount++;
            }
        }
        await transaction.commit();
        return { createdTaskCount, createdTaskPetCount, alreadyExistedOrSkippedCount, totalProcessedFromPreviousDay: tasksFromPreviousDay.length }
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

// xóa công việc
const deleteTask = async(id) => {
    try {
        const task = await getTaskById(id);
        const taskPets = await TaskPet.findAll({ where: { task_id: id } });

        for(const taskPet of taskPets){
            await taskPet.destroy();
        }
        await task.destroy();
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi xóa: " + error.message)
    }
}

// lấy tổng công việc, công việc ngày hôm nay, tổng nhân sự (chuyên viên + nhân viên đang hoạt động)
const getTotalTaskAndStaff = async() => {
    try {
        // ✅ Lấy giờ theo timezone VN
        const todayStr = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh'
        });
        const date = new Date(todayStr);

        // ✅ Tính start & end của hôm nay
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Chạy song song
        const [totalTask, todayTask, totalStaff] = await Promise.all([
            // Tổng task,
            Task.count(),

            // Task hôm nay
            Task.count({
                where: {
                    due_date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            }),

            // Tổng nhân sự
            User.count({
                where: {
                    role: {
                        [Op.in]: ['specialist', 'employee']
                    },
                    is_actived: 1
                }
            })
        ]);
        
        return {
            totalTask,
            todayTask,
            totalStaff
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi lấy danh sách: " + error.message)
    }
}

// Lấy danh sách hình ảnh công việc
const queryListImages = async() => {
    try {
        const { rows: imagesTaskDB } = await Task.findAndCountAll({
            include: [
                {
                    model: TaskImage,
                    as: 'taskImages',
                },
            ],  
            order: [[ 'createdAt', 'ASC' ]],
            distinct: true  
        })

        const groupedData = {};

        imagesTaskDB.forEach((item) => {
            const data = item.toJSON();
            const dueDate = data.due_date;

            // Nếu chưa có dueDate thì khởi tạo
            if (!groupedData[dueDate]) {
                groupedData[dueDate] = {
                    dueDate: dueDate,
                    images: []
                };
            }

            // Nếu có ảnh thì push vào
            if (Array.isArray(data.taskImages) && data.taskImages.length > 0) {
                data.taskImages.forEach((image) => {
                    groupedData[dueDate].images.push({
                        id: image.id,
                        nameImage: image.name_image,
                        urlImage: image.url_image
                    });
                });
            }
        });

        return Object.values(groupedData);
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra khi lấy danh sách: " + error.message)        
    }
}

// Lấy dạnh sách hình ảnh khi click ngày
const queryListImagesByDate = async(queryOption) => {
    try {
        const { date } = queryOption
        const rawDate = new Date(date)

        // ✅ Lấy giờ theo timezone VN
        const todayStr = rawDate.toLocaleString('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh'
        });

        const dateSelected = new Date(todayStr);

        // ✅ Tính start & end của hôm nay
        const startOfDay = new Date(dateSelected);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateSelected);
        endOfDay.setHours(23, 59, 59, 999);
        
        const whereClause = {
            due_date: {
                [Op.between]: [startOfDay, endOfDay]
            }
        };
        const imagesTaskByDateDB = await Task.findAll({
            where: whereClause,
            include: [
                {
                    model: TaskImage,
                    as: 'taskImages',
                },
            ],
            order: [[ 'createdAt', 'ASC' ]],
            distinct: true
        });

        const result = {
            dueDate: endOfDay,
            images: []
        };

        imagesTaskByDateDB.forEach((item) => {
            const data = item.toJSON();
            // Nếu có ảnh thì push vào
            if (Array.isArray(data.taskImages) && data.taskImages.length > 0) {
                data.taskImages.forEach((image) => {
                    result.images.push({
                        id: image.id,
                        nameImage: image.name_image,
                        urlImage: image.url_image
                    });
                });
            }
        });

        return result;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra: " + error.message)
    }
}
// Quản lý xóa 1 ảnh của công việc:
// - xóa bản ghi trong CSDL TaskImages + xóa ảnh trên Cloudinary
// - đưa công việc về trạng thái pending
// - tạo thông báo + bắn socket cho người chụp ảnh kèm lý do
const deleteTaskImage = async (imageId, payload) => {
    const { reason, deletedBy } = payload;

    // Dữ liệu cần dùng để tạo thông báo sau khi commit
    let notificationData = null;
    let cloudinaryTarget = null;

    const transaction = await sequelize.transaction();
    try {
        const image = await TaskImage.findByPk(imageId, {
            include: [
                { model: Task, as: 'imagesTask' },
                { model: User, as: 'uploadedBy' }
            ],
            transaction
        });

        if (!image) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy ảnh cần xóa.');
        }

        const task = image.imagesTask;
        const uploaderId = image.uploaded_by;
        const imageName = image.name_image;
        const imageUrl = image.url_image;

        cloudinaryTarget = parseCloudinaryUrl(imageUrl);

        // 1. Xóa bản ghi ảnh trong CSDL
        await image.destroy({ transaction });

        // 2. Đưa công việc về trạng thái pending
        if (task) {
            task.status = 'pending';
            // Nếu không còn ảnh nào thì đánh dấu công việc chưa cập nhật ảnh
            const remaining = await TaskImage.count({ where: { task_id: task.id }, transaction });
            if (remaining === 0) {
                task.is_updated_image = false;
            }
            await task.save({ transaction });
        }

        // Chuẩn bị dữ liệu thông báo (sẽ tạo sau khi commit thành công)
        if (uploaderId) {
            const taskName = task ? task.name : 'công việc';
            notificationData = {
                recipientId: uploaderId,
                senderId: deletedBy || null,
                taskId: task ? task.id : null,
                type: 'image_deleted',
                title: 'Ảnh của bạn đã bị xóa',
                message: `Quản lý đã xóa ảnh "${imageName}" trong công việc "${taskName}". Công việc đã được chuyển về trạng thái chờ xử lý.`,
                reason: reason || null,
                metadata: { imageName, imageUrl, taskName }
            };
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        if (error instanceof ApiError) throw error;
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Đã có lỗi xảy ra khi xóa ảnh: ' + error.message);
    }

    // 3. Xóa ảnh trên Cloudinary (ngoài transaction — lỗi ở đây chỉ log, không rollback DB)
    if (cloudinaryTarget && cloudinaryTarget.publicId) {
        try {
            await cloudinary.uploader.destroy(cloudinaryTarget.publicId, {
                resource_type: cloudinaryTarget.resourceType
            });
        } catch (cloudErr) {
            logger.error(`Không thể xóa ảnh trên Cloudinary (publicId: ${cloudinaryTarget.publicId}): ${cloudErr.message}`);
        }
    }

    // 4. Tạo thông báo + bắn socket cho người chụp ảnh (sau khi DB đã commit)
    if (notificationData) {
        try {
            await notificationService.createNotification(notificationData);
        } catch (notifyErr) {
            logger.error(`Không thể tạo thông báo cho người chụp ảnh: ${notifyErr.message}`);
        }
    }
};

module.exports = {
    createTask,
    queryTasks,
    updatedStatus,
    updateImagesForTask,
    queryTask,
    rolloverOrRecreateTasksForToday,
    deleteOldTasks,
    queryTasksForSpecialist,
    deleteTask,
    getTotalTaskAndStaff,
    queryListImages,
    queryListImagesByDate,
    deleteTaskImage
}