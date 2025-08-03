---
applyTo: '/backend/src/modules/accounts/'
---
# Accounts Backend Instructions
The folder named "accounts" is the accounts module of the backend.
For the backend, express.js is used.
For the database, PostgreSQL is used.
The accounts module handles user authentication, registration, and profile management.
The folder contains the necessary controllers, services, and routes to manage user accounts.
It also includes middleware for authentication and authorization.
The accounts module is designed to be secure and efficient, ensuring that user data is protected and that operations are performed quickly.
The module is structured to allow for easy expansion and integration with other parts of the backend system.
The accounts module is responsible for:
- User registration and login  
- User profile management
- Uset authentication and authorization
- User data validation
- Integration with the database for user data storage
- Error handling and response management
- Middleware for security and performance optimization
- Logging and monitoring of user-related operations
- User session management
- Users can only access their own data
- User roles and permissions management
- Users can update their profiles
- Users can only register with OAuth 2.0
- Integration with third-party authentication providers
- The third party authentication providers are Google, Apple, and Microsoft 365

The accounts module is designed to be modular and reusable, allowing for easy integration with other modules in the backend system.
It follows best practices for security and performance, ensuring that user data is handled securely and efficiently.
The module is also designed to be scalable, allowing for easy expansion as the application grows.
The accounts module is a critical part of the backend system, providing the necessary functionality for user management and authentication.
The module is built with a focus on security, performance, and usability, ensuring that users have a seamless experience while interacting with the application.
The accounts module is also designed to be easily testable, with unit tests and integration tests to ensure that the functionality works as expected.
The module is structured to allow for easy maintenance and updates, with clear separation of concerns and well-defined interfaces.
The folder /backend/src/modules/accounts/ contains the following subfolders:
- controllers: Contains the controllers for handling user requests and responses.
- services: Contains the services for business logic and data manipulation.
- routes: Contains the routes for user-related endpoints.
- strategies: Contains the authentication strategies for user login and registration.
- types: Contains the types and interfaces for user data and requests.
- utils: Contains utility functions for user data validation and manipulation.

