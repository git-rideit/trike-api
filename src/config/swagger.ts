import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mongo API Template',
            version: '1.0.0',
            description: 'A robust and scalable MongoDB API template using Express.js and TypeScript',
            license: {
                name: 'ISC',
            },
            contact: {
                name: 'jon-carlo',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api/v1`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
