// src/config/swagger.config.js
const config = require('./index') // Hoặc const appConfig = require('./appConfig');
const version = require('../../package.json'); // Lấy version từ package.json;

const swaggerDefinitionObject = { // Đổi tên để tránh nhầm lẫn với key "definition" của options
    openapi: '3.0.0',
    info: {
        title: 'Pet API',
        version: version,
        description: 'API documentation for the Pet System. This API allows manage pets, users, tasks and more.',
        license: {
            name: 'MIT',
            url: 'https://choosealicense.com/licenses/mit',
        },
        contact: {
            name: 'Your Name/Company',
            url: 'https://yourwebsite.com',
            email: 'info@yourwebsite.com'
        },
    },
    servers: [
        {
            url: `http://localhost:${config.port || process.env.PORT || 3002}/api/v1`,
            description: 'Development server (1)'
        },
    ],
    components: {
        // Các components (schemas, responses, securitySchemas, etc.) sẽ được swagger-jsdoc.
        // tự động gộp vào từ các file JSDoc được quét trong apis.
        // Bạn không cần định nghĩa lại User, Error ở đây nếu chúng có trong src/docs/components.js.
        // hoặc các schema payload trong src/validators/*.js.
        // Tuy nhiên, nếu bạn muốn định nghĩa một số thứ cố định ở đây cũng được.
        // Ví dụ, securitySchemas có thể đạt ở đây hoặc trong src/docs/components.js
        securitySchemas: {
            bearerAuth: {
                type: 'http',
                schema: 'bearer',
                bearerFormat: 'JWT'
            },
        },
        schemas: {
            // Nếu bạn muốn User và Error được định nghĩa cố định ở đây thay vì trong componens.js:
            /*
            User: {
                type: 'object',
                // ... properties ...
            },
            Error: {
                type: 'object',
                // ... properties ...
            }
            */
        },
        responses: {
            // Tương tự, nếu muốn định nghĩa cố định ở đây:
            /*
            Unauthorized: { ... },
            BadRequest: { ... },
            */
        }
    }
};

const options = {
    definition: swaggerDefinitionObject, // SỬ DỤNG KEY 'definition' và truyền đối tượng định nghĩa ở trên
    apis: [
        './src/routes/*.js', // Quét các file route (nơi có định nghĩa endpoint)
        './src/validator/*.js',  // Quét các file validator (nơi có định nghĩa schema payload)
        './src/docs/components.js'  // QUAN TRỌNG: Đảm bảo file này được quét để lấy User, Error, và các response chung
    ]
};

const swaggerJsdoc = require('swagger-jsdoc'); // Import swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options); // GỌI swaggerJsdoc(options) ĐỂ TẠO SPEC HOÀN CHỈNH

// In ra để kiểm tra cấu trúc của swaggerSpec cuối cùng
// console.log('Generated Swagger Spec in swagger.config.js:', JSON.stringify(swaggerSpec, null, 2));

module.exports = swaggerSpec; // <<<< QUAN TRỌNG: EXPORT swaggerSpec, KHÔNG PHẢI options