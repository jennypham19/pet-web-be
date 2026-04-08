// src/jobs/dailyTasks.job.js
const cron = require('node-cron');
const taskService = require('../services/task.service.js');
const { JobExecutionLog } = require('../models');
const logger = require('../config/logger');

const ROLLOVER_JOB_NAME = 'rolloverDailyTasks';
const DELETE_OLD_TASKS_JOB_NAME = 'deleteOldTasks';

// ✅ Lấy ngày VN chuẩn
const getTodayVN = () => {
    return new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh'
    });
};

const runRolloverJobAndLog = async(targetDateString) => {
    try {
        const result = await taskService.rolloverOrRecreateTasksForToday(targetDateString);
        await JobExecutionLog.create({
            job_name: ROLLOVER_JOB_NAME,
            run_date: targetDateString,
            status: 'success',
            executed_at: new Date(),
        });
    } catch (error) {
        await JobExecutionLog.create({
            job_name: ROLLOVER_JOB_NAME,
            run_date: targetDateString,
            status: 'failed',
            executed_at: new Date(),
            error_message: error.message
        }).catch(logError => logger.error(`[JOB_RUNNER] Failed to log error for ${ROLLOVER_JOB_NAME}:`, logError));

    }
}

const runDeleteOldTasksAndLog = async() => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const result = await taskService.deleteOldTasks(30);
        await JobExecutionLog.create({
            job_name: DELETE_OLD_TASKS_JOB_NAME,
            run_date: today,
            status: 'success',
            executed_at: new Date(),
        })
    } catch (error) {
        await JobExecutionLog.create({
            job_name: DELETE_OLD_TASKS_JOB_NAME,
            run_date: today,
            status: 'failed',
            executed_at: new Date(),
            error_message: error.message
        }).catch(logError => logger.error(`[JOB_RUNNER] Failed to log error for ${DELETE_OLD_TASKS_JOB_NAME}:`, logError));
    }
}

// ✅ chạy nếu bị miss (sau restart)
const checkAndRunMissedDailyTasks = async() => {
    const todayString = getTodayVN();
    console.log(`[JOB_CATCH_UP] Checking for missed daily tasks for ${todayString}`);
    
    const rolloverRun = await JobExecutionLog.findOne({
        where: { job_name: ROLLOVER_JOB_NAME, run_date: todayString, status: 'success' }
    });
    if(!rolloverRun){
        await runRolloverJobAndLog(todayString);
    }else {
        logger.info(`[JOB_CATCH_UP] ${ROLLOVER_JOB_NAME} for ${todayString} already successfully run at ${rolloverRun.executed_at}.`);
    }

    // const deleteRun = await JobExecutionLog.findOne({
    //     where: { job_name: DELETE_OLD_TASKS_JOB_NAME, run_date: todayString, status: 'failed' }
    // });
    // if(!deleteRun){
    //     await runDeleteOldTasksAndLog();
    // }else {
    //     logger.info(`[JOB_CATCH_UP] ${DELETE_OLD_TASKS_JOB_NAME} for ${todayString} already failed at ${deleteRun.executed_at}.`);
    // }
}

// ✅ Cron chính (chạy mỗi phút cho chắc)
const scheduleDailyTasksManagement = () => {
    cron.schedule('*1 0 * * *', async() => { // Chạy vào lúc 00:01 hàng ngày
        const today = getTodayVN() // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
        // Kiểm tra lại một lần nữa để tránh chạy trùng nếu catch-up vừa chạy
        const alreadyRun = await JobExecutionLog.findOne({ where: { job_name: ROLLOVER_JOB_NAME, run_date: today, status: 'success' } });
        if(!alreadyRun){
            await runRolloverJobAndLog(today);
        } else {
            logger.info('[CRON_SCHEDULE] Rollover job for today already processed. Skipping scheduled run.');
        }
    }, { scheduled: true, timezone: 'Asia/Ho_Chi_Minh' });

    // Lịch chạy cho Delete Old Tasks
    // cron.schedule('5 0 * * *', async() => { // Chạy vào lúc 00:05 hàng ngày
    //     await runDeleteOldTasksAndLog();
    // }, { scheduled: true, timezone: 'Asia/Ho_Chi_Minh' });
}

const initializeDailyJobs = async() => {
    scheduleDailyTasksManagement();
    setTimeout(async () => {
        await checkAndRunMissedDailyTasks();
    }, 15000); // Chờ 15 giây sau khi khởi động để đảm bảo DB đã sẵn sàng
}

module.exports = { initializeDailyJobs}