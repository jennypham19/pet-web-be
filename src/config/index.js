// src/config/index.js

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env')});

// ============================================================
// 1. ĐỊNH NGHĨA CẤU HÌNH CHO SEQUELIZE CLI (dựa trên code của bạn)
// ============================================================

const sequelizeCliConfig = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        dialect: 'postgres',
    },
    production: {
        // Sequelize CLI trong production sẽ dùng DATABASE_URL
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false }
        }
    }
}

// =============================================================
// 2. TẠO OBJECT CẤU HÌNH "SẠCH" CHO ỨNG DỤNG (dựa trên code của bạn)
// =============================================================

const env = process.env.NODE_ENV || 'development';
const appConfig = {
    env: env,
    port: parseInt(process.env.PORT, 10),
    // Lấy cấu hình DB tương ứng với môi trường hiện tại
    db: sequelizeCliConfig[env],
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10),
        refreshExpirationDays: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10),
    },
    corsOriginFe: process.env.CORS_ORIGIN_FE,
    logLevel: process.env.LOG_LEVEL
}

// =============================================================
// 3. KIỂM TRA CÁC BIẾN QUAN TRỌNG
// =============================================================

if(appConfig.env === 'production'){
    if(!appConfig.jwt.secret || !appConfig.jwt.refreshSecret){
        console.error("\x1b[31m%s\x1b[0m", "FATAL ERROR: JWT_SECRET or JWT_REFRESH_SECRET is not defined in production.");
        process.exit(1);
    }
    if(!sequelizeCliConfig.production.use_env_variable) {
        console.error("\x1b[31m%s\x1b[0m", "FATAL ERROR: DATABASE_URL is not configured for production.");
        process.exit(1)
    }
}else { // Development checks
    if(!appConfig.jwt.secret || !appConfig.jwt.refreshSecret){
        console.warn("\x1b[33m%s\x1b[0m", "WARNING: JWT_SECRET or JWT_REFRESH_SECRET is not defined in .env. Using fallback values which is INSECURE.");
        // Gán giá trị fallback ở đây để dev không bị crash
        appConfig.jwt.secret = appConfig.jwt.secret || 'dev-secret';
        appConfig.jwt.refreshSecret = appConfig.jwt.refreshSecret || 'dev-refresh-secret'; 
    }    
}

// =============================================================
// 4. EXPORT KẾT HỢP CẢ HAI
// =============================================================

module.exports = {
    // Xuất ra object config sạch cho ứng dụng
    ...appConfig,

    // Xuất ra các key mà Sequelize CLI cần
    development: sequelizeCliConfig.development,
    production: sequelizeCliConfig.production
}