# Trike API

A robust and scalable RESTful API for a Tricycle Booking Application, built with Express.js, TypeScript, and MongoDB.

## 🚀 Features

- **User Management**:
  - Role-based access control (`user`, `driver`, `admin`).
  - Secure authentication with JWT and Bcrypt.
  - Driver profile management including license and vehicle details.

- **Booking System**:
  - Real-time booking lifecycle (`pending` -> `accepted` -> `in_progress` -> `completed`).
  - Distance calculation using geospatial data (Coordinates).
  - Support for efficient pickup and drop-off location tracking.

- **Fare Calculation**:
  - Dynamic fare computation based on base fare and distance (`baseFare + (distance * ratePerKm)`).
  - Admin-configurable fare settings.

- **Admin Dashboard Support**:
  - Comprehensive analytics and reporting.
  - Audit logging for critical actions.
  - System-wide settings management.

- **Security & Reliability**:
  - Rate limiting and Brute-force protection.
  - Data sanitization against NoSQL injection.
  - Structured logging with Winston.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Documentation**: Swagger UI
- **Validation**: Zod
- **Media**: Cloudinary & Multer

## ⚡ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (Optional, for media uploads)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd trike-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy the example env file:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your credentials:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Secret key for token generation.
   - `CLOUDINARY_*`: API keys for image uploads.

### Running the Server

- **Development Mode** (with hot-reload):
  ```bash
  npm run dev
  ```

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI.
Once the server is running, verify the endpoints at:

**`http://localhost:3000/api-docs`**

## 📂 Project Structure

```
src/
├── config/         # Configuration (DB, Env, Swagger)
├── controllers/    # Route Logic (Admin, Auth, Booking, Users)
├── middleware/     # Auth, Validation, Error Handling
├── models/         # Mongoose Schemas (Booking, FareConfig, User, etc.)
├── routes/         # API Endpoint Definitions
├── services/       # External Services (e.g., Cloudinary)
├── utils/          # Helper Functions
└── app.ts          # Express App setup
```

## 🔌 Key Endpoints

### Auth
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Get access token

### Bookings
- `POST /api/v1/bookings` - Create a booking
- `GET /api/v1/bookings` - Get user bookings

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `POST /api/v1/users` - Create user (Admin only)

## 👤 Author

**jon-carlo**
