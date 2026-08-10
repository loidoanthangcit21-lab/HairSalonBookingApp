# Hair Salon Booking API

Backend system for a Hair Salon Booking application, built with **Spring Boot 3** and **PostgreSQL**.

## 🚀 Technologies
- **Java 17**
- **Spring Boot 3.2.x** (Web, Data JPA, Security, Mail, Validation)
- **PostgreSQL 15+**
- **JWT (JSON Web Token)** for Stateless Authentication
- **Lombok**
- **MapStruct** (for DTO mapping)

---

## 📚 API Endpoints

### 1. Authentication APIs (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register a new customer account | ❌ No |
| `GET`  | `/verify-email?token={otp}` | Verify email using OTP | ❌ No |
| `POST` | `/login` | Login with email and password | ❌ No |
| `POST` | `/google` | Login with Google ID Token | ❌ No |
| `POST` | `/refresh` | Refresh access token | ❌ No |
| `POST` | `/logout` | Logout (revoke refresh token) | ❌ No |
| `POST` | `/forgot-password` | Send password reset OTP | ❌ No |
| `POST` | `/reset-password` | Reset password using OTP | ❌ No |
| `POST` | `/resend-verification`| Resend email verification OTP | ❌ No |
| `PUT`  | `/change-password` | Change password for logged-in user | ✅ Yes |

### 2. User Profile APIs (`/api/users/me`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/me` | Get current user's profile | ✅ Yes |
| `PUT`  | `/me` | Update current user's profile | ✅ Yes |

### 3. User Management APIs (`/api/users`)
*Requires `ADMIN` role.*
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/` | Get paginated list of users (filterable by role) | ✅ ADMIN |
| `GET`  | `/{id}` | Get specific user details | ✅ ADMIN |
| `PUT`  | `/{id}/role` | Change user's role | ✅ ADMIN |
| `PUT`  | `/{id}/status`| Block/Unblock user account | ✅ ADMIN |

---

## 🛠️ Setup & Installation

1. **Clone the repository**
2. **Configure Database**:
   Create a PostgreSQL database and configure the credentials in `src/main/resources/application.properties` (or `.env` file).
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/your_db_name
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
3. **Configure Mail Server**:
   Ensure SMTP properties for Gmail (or other providers) are correctly set for sending OTPs.
4. **Run the Application**:
   ```bash
   ./mvnw spring-boot:run
   ```
   The server will start on `http://localhost:8080`.

---
*Note: This project is under active development. Category, Service, Stylist, and Booking APIs will be added soon.*
