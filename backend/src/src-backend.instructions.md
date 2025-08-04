---
applyTo: 'backend/src'
---
# Backend SRC Instructions
The folder named "src" is the source code folder for the backend.
For the backend, Express.js is used as the web framework.
For the database, PostgreSQL is used.
The backend is structured to handle various functionalities such as user authentication, data processing, and API endpoints.
The source code is organized into modules, each responsible for a specific part of the application.
The backend communicates with the frontend through RESTful APIs.
Ensure to follow best practices for security, such as input validation and error handling.
The src folder contains the main application logic, including routes, controllers, and services.
The backend/src/config folder contains configuration files for the application, such as database connection settings and environment variables.
The backend/src/docs folder contains API documentation, which is generated from the source code comments.
The backend/src/midleware folder contains middleware functions that process requests before they reach the route handlers.
The backend/src/modules folder contains the main application modules, each encapsulating specific functionality.
The backend/src/prisma folder contains the Prisma ORM setup, which is used for database interactions.
The backend/src/services folder contains service classes that encapsulate business logic and data manipulation.
The backend/src/tmp folder is used for temporary files and should not be committed to version control.
The backend/src/types folder contains TypeScript type definitions used throughout the application.
The backend/src/utils folder contains utility functions that are used across different parts of the application.
The backend/src/server.ts file is the entry point of the application, where the Express server is initialized and configured.