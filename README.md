# Mongo API Template

A robust, scalable, and universal MongoDB template using Express.js and TypeScript. Designed for building modern web, mobile, and desktop applications.

## 🚀 Features

- **TypeScript**: Fully typed codebase for reliability and developer experience.
- **Express.js**: Fast, minimalist web framework.
- **MongoDB & Mongoose**: Asynchronous database interaction with object modeling.
- **🔐 Authentication & Authorization**:
  - **JWT (JSON Web Tokens)**: Stateless authentication suitable for Web & Mobile.
  - **Bcrypt**: Secure password hashing.
  - **Role-Based Access Control**: Granular permissions (`user`, `admin`).
- **🛡️ Security**:
  - `helmet`: Secure HTTP headers.
  - `express-mongo-sanitize`: Prevent NoSQL injection.
  - `cors`: Configurable Cross-Origin Resource Sharing.
  - `express-rate-limit`: Brute-force protection.
- **☁️ Media Management**:
  - **Cloudinary**: Seamless image/video uploads.
  - **Multer**: Efficient file handling.
- **📝 Documentation**:
  - **Swagger UI**: Interactive API testing playground at `/api-docs`.
- **Validation**: Request data validation using `zod`.
- **Logging**: Structured logging with `winston`.
- **Universal Deployment**: Ready for Vercel, Docker, VPS, or any Node.js host.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Atlas or Local)
- Cloudinary Account (for media uploads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mongo-api-template
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   open `.env` and configure:
   - `MONGO_URI`
   - `JWT_SECRET` & `JWT_EXPIRES_IN`
   - `CLOUDINARY_*` credentials

### Running the Application

- **Development** (Hot Reload):
  ```bash
  npm run dev
  ```

- **Production**:
  ```bash
  npm run build
  npm start
  ```

## 📚 API Documentation

Once the server is running, visit:
**`http://localhost:3000/api-docs`**

This provides a full GUI to:
- Explore endpoints.
- Authorize with your JWT token.
- Test requests directly in the browser.

## 📂 Project Structure

```
src/
├── config/         # Env, Database, Cloudinary, Swagger config
├── controllers/    # Request/Response logic
├── middleware/     # Auth, Errors, RateLimit, Upload, Validation
├── models/         # Mongoose Schemas (User, etc.)
├── routes/         # API Route definitions
├── services/       # Business logic (e.g., Cloudinary)
├── utils/          # Logger, AppError, CatchAsync
├── app.ts          # Express App setup (Middleware wiring)
└── server.ts       # Entry point (DB connect & Server start)
```

## 🔌 Key Endpoints

### Auth
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Get access token

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `POST /api/v1/users` - Create user (Admin only)
- `GET /api/v1/users/:id` - Get user details

## 👤 Author

**jon-carlo**
