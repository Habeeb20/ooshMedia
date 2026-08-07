// config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Estores API",
      version: "1.0.0",
      description: "API documentation for the Estores e-commerce backend",
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Glob pattern(s) pointing to files with your Swagger JSDoc comments
  apis: ["../routes/*.js", "./controllers/**/*.js", "../models/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);