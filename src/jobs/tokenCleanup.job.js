// src/jobs/tokenCleanup.job.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const moment = require('moment');
const { Token, JobExecutionLog } = require('../models');
const logger = require('../config/logger');

const CLEANUP_BLACKLISTED_JOB_NAME = 'cleanupBlacklistedTokens';
const CLEANUP_EXPIRED_JOB_NAME = 'cleanupExpiredTokens';

const cleanupBlacklistedTokensAndLog = async () => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const now = moment().toDate();
    const result = await Token.destroy({ where: { blacklisted: true, updatedAt: { [Op.lt]: now } } });
    await JobExecutionLog.create({
        job_name: CLEANUP_BLACKLISTED_JOB_NAME, run_date: today, status: 'success', executed_at: new Date()
    });
  } catch (error) {
    await JobExecutionLog.create({
        job_name: CLEANUP_BLACKLISTED_JOB_NAME, run_date: today, status: 'failed', executed_at: new Date(), error_message: error.message
    }).catch(logError => logger.error(`[JOB_RUNNER] Failed to log error for ${CLEANUP_BLACKLISTED_JOB_NAME}:`, logError));
  }
};

const cleanupExpiredTokensAndLog = async () => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const now = moment().toDate();
    const result = await Token.destroy({ where: { expires: { [Op.lt]: now } } });
    await JobExecutionLog.create({
        job_name: CLEANUP_EXPIRED_JOB_NAME, run_date: today, status: 'success', executed_at: new Date()
    });
  } catch (error) {
     await JobExecutionLog.create({
        job_name: CLEANUP_EXPIRED_JOB_NAME, run_date: today, status: 'failed', executed_at: new Date(), error_message: error.message
    }).catch(logError => logger.error(`[JOB_RUNNER] Failed to log error for ${CLEANUP_EXPIRED_JOB_NAME}:`, logError));
  }
};

const checkAndRunMissedTokenCleanups = async () => {
    const todayString = new Date().toISOString().split('T')[0];

    const blacklistedRun = await JobExecutionLog.findOne({
        where: { job_name: CLEANUP_BLACKLISTED_JOB_NAME, run_date: todayString, status: 'success' }
    });
    if (!blacklistedRun) {
        await cleanupBlacklistedTokensAndLog();
    } else {
         logger.info(`[JOB_CATCH_UP] ${CLEANUP_BLACKLISTED_JOB_NAME} for ${todayString} already run.`);
    }

    const expiredRun = await JobExecutionLog.findOne({
        where: { job_name: CLEANUP_EXPIRED_JOB_NAME, run_date: todayString, status: 'success' }
    });
    if (!expiredRun) {
        await cleanupExpiredTokensAndLog();
    } else {
        logger.info(`[JOB_CATCH_UP] ${CLEANUP_EXPIRED_JOB_NAME} for ${todayString} already run.`);
    }
};

const scheduleTokenCleanup = () => {
  cron.schedule('0 2 * * *', async () => { 
    const today = new Date().toISOString().split('T')[0];
    const alreadyRun = await JobExecutionLog.findOne({where: {job_name: CLEANUP_BLACKLISTED_JOB_NAME, run_date: today, status: 'success'}});
    if(!alreadyRun) await cleanupBlacklistedTokensAndLog(); else logger.info('[CRON_SCHEDULE] Blacklisted token cleanup for today already processed.');
  }, { scheduled: true, timezone: "Asia/Ho_Chi_Minh" });

  cron.schedule('30 2 * * *', async () => {
    const today = new Date().toISOString().split('T')[0];
    const alreadyRun = await JobExecutionLog.findOne({where: {job_name: CLEANUP_EXPIRED_JOB_NAME, run_date: today, status: 'success'}});
    if(!alreadyRun) await cleanupExpiredTokensAndLog(); else logger.info('[CRON_SCHEDULE] Expired token cleanup for today already processed.');
  }, { scheduled: true, timezone: "Asia/Ho_Chi_Minh" });
};


const initializeTokenCleanupJobs = async () => { 
    scheduleTokenCleanup();
    setTimeout(async () => {
        await checkAndRunMissedTokenCleanups();
    }, 20000); // Chờ 20 giây (sau daily tasks)
};


module.exports = {
  initializeTokenCleanupJobs,
};