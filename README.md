# Auth Service

A backend microservice built with Node.js, NestJS, MongoDB (Mongoose), and TypeScript.  
The service manages application authentication and authorization, in a private way which does not save any identifying user data (only oauth ID is saved).  
Main features include login VIA google OAuth, JWT-based authentication (including refresh), user management and abilty to make users admins by other admins.  
This project is part of a larger system - [Anonymous Salary Reports](https://github.com/Anonymous-Salary-Reports)

## 🛠️ Tech Stack
| Layer              | Technology                               |
|--------------------|------------------------------------------|
| **Runtime**        | Node.js                                  |
| **Framework**      | NestJS                                   |
| **Language**       | TypeScript                               |
| **Database**       | MongoDB + Mongoose ODM                   |
| **Authentication** | JWT, Passport, OAuth                     |
| **Validation**     | Class-validator / class-transformer      |
| **Code Quality**   | ESLint + Prettier                        |


## 🔌 API Endpoints
- `GET /auth/login` - Login endpoint
- `GET /auth/google-redirect` - Redirect endpoint for Google OAuth
- `POST /auth/refresh` - Refresh JWT access token
- `POST /auth/logout` - Logout endpoint (invalidate refresh token)
- `GET /user/find-all` - Get all users (admin-only endpoint)
- `POST /user/make-admin/:userId` - Make a user an admin (admin-only endpoint)

## 🚀 Getting Started
### Prerequisites

Before running this service, ensure you have the following installed:

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** 1.22+
- **MongoDB** 6.0+ (or MongoDB Atlas account for cloud database)
- **Git** (for cloning the repository)

### Installation
- Run `git clone https://github.com/Anonymous-Salary-Reports/salary-reports-auth-service.git`
- Run `cd salary-reports-auth-service`
- Run `npm install`
- create .env file with properties:  
  MONGODB_URI, MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD, MONGO_INITDB_DATABASE, PORT, JWT_REFRESH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
- Create also property JWT_ACCESS_SECRET which has to match the one in the salary service
- If you're on windows and using WSL, run docker desktop
- Run `docker compose up -d`
- Start the application by `npm run start:dev`

## Future Improvements
- [ ] Implement unit, integration and e2e tests as seen in [salary-service](https://github.com/Anonymous-Salary-Reports/salary-reports-salary-service) using Jest, Supertest and mongodb-memory-server
- [ ] Add functionality to delete users (admin-only endpoint)
- [ ] Add functionality to revoke admin privileges from users (admin-only endpoint)