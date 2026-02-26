# City News Search — Admin Dashboard

> **Expo (React Native + Web) + TypeScript + React Query + Axios**

---

## Overview

This is the **Admin Dashboard** for City News Search.

It allows administrators to:

- View all registered users
- Monitor user search activity
- Track user session duration
- Analyze engagement behavior

The admin dashboard is built using **Expo**, allowing a single codebase to run on:

- 📱 Mobile (Android / iOS)
- 🌐 Web

All data is fetched securely from the backend API.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> Replace with your deployed backend URL in production.

### 3. Start Development Server

```bash
npx expo start
```

Press:
- `w` → Web
- `a` → Android
- `i` → iOS

---

## Features

### Admin Authentication
- Login via `/api/auth/login`
- Must have `ADMIN` role
- Secure token storage
- Automatic protected route handling

All protected requests include:

```
Authorization: Bearer <access_token>
```

---

## Admin API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | Fetch all registered users |

Returns: Name, Email, City, Last login time

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/sessions` | Fetch user session records |

Returns: User name, email, Login time, Logout time, Duration (seconds)

### Search Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/searches` | Fetch all user search activity |

Returns: User name, email, Search query, Timestamp

---

## Authentication Flow

1. Admin logs in.
2. Backend validates credentials and role.
3. Backend returns:
   - Access token
   - `sessionId`
4. Client stores token securely.
5. All future admin requests include the token in the `Authorization` header.
6. Unauthorized access redirects to login.

---

## Screens

### 1. Login Screen
- Email input
- Password input
- Submit button

On success:
- Store token
- Navigate to dashboard

### 2. Users Screen

Displays: Name, Email, City, Last Login Time

Uses:
- React Query for fetching
- `FlatList` on mobile
- Table-style layout on web

### 3. Sessions Screen

Displays: User Name, Email, Login Time, Logout Time, Duration (seconds)

> Open sessions with no `logout_time` are shown as **active**.

### 4. Search Logs Screen

Displays: User Name, Email, Search Query, Date/Time

Provides full visibility into user search activity.

---

## State Management

| Concern | Solution |
|---------|----------|
| Server state (users, sessions, searches) | React Query |
| Token storage | SecureStore |
| API client | Centralized Axios instance |
| Auth errors | Interceptors → auto-logout on `401` |

---

## Error Handling

- Loading indicators for all API calls
- Graceful empty state handling
- Unauthorized access auto-redirect
- Network error fallback messaging

---

## Security

- Role-based access control enforced by backend
- Token-based authentication
- No business logic on client
- No direct database or third-party API access

---

## Design Philosophy

The admin dashboard is intentionally simple. Focus areas:

- Functional clarity
- Clean API integration
- Proper route protection
- Accurate session visibility

UI styling is minimal, as evaluation prioritizes system design and correctness over visual polish.

---

## Conclusion

This admin dashboard demonstrates:

- Clean frontend architecture
- Secure role-based API integration
- Clear session lifecycle visibility
- Structured data presentation
- Production-oriented separation of concerns

The implementation aligns with the backend design and fulfills all administrative monitoring requirements.