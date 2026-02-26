# City News Search – Implementation Documentation
## Overview

This project is a full-stack application that allows users to search city-based news and enables admins to monitor user activity and session engagement.

## The system includes:
📱 User Mobile App (Expo)
🖥 Admin Dashboard (Expo Web + Mobile)
🔧 Backend (Node.js + Express + TypeScript)
🗄 PostgreSQL
🔐 Convex Authentication
🌍 Google SERP API (via backend proxy)

The focus was on clean architecture, session tracking, and structured API design rather than UI complexity.

## Architecture Approach

I followed Clean Architecture principles to ensure:
* Clear separation of concerns
* Maintainability
* Scalability
* Framework independence

Backend layers:
* Domain – Entities & repository interfaces
* Application – Use cases (business logic)
* Infrastructure – Prisma, Convex auth validation, SERP integration
* Interface – Routes, controllers, middleware

This keeps business logic independent from Express, Prisma, and other frameworks.

## Backend Design
### Database Tables
#### users
* id, name, email, password_hash, city, role
* last_login_at, timestamps

#### sessions

* user_id
* login_time
* logout_time
* duration_seconds
* Name
* Email 

(I added name email for better understanding but this can be easily removed if required)

#### searches
* user_id
* session_id
* search_query
* city
* timestamp
*  Name
* Email 

(I added name email for better understanding but this can be easily removed if required)

#### Design Intuition

* Sessions separated from users for proper lifecycle tracking.
* Searches linked to sessions for engagement visibility.
* Duration stored explicitly for efficient admin queries.

## Authentication (Convex Integration)

Convex handles authentication and token issuance.

### Backend responsibilities:

* Validate Convex JWT
* Map Convex identity to internal user
* Protect routes
* Enforce admin role access

This simplifies auth while keeping authorization and business logic controlled in the backend.

## Session Tracking Strategy

This was the most critical requirement.

### On Login:

* Create session record
* Store login_time
* Return sessionId and token issues from convex

### On Logout:

* Update logout_time
* Calculate duration_seconds

If the app crashes, logout_time remains null — acceptable as per assignment.
The goal was logical lifecycle tracking rather than perfect edge-case handling.

## SERP API Integration

The mobile app does not call Google SERP directly.

### Flow:

1. Client calls /api/news?city=
    * Backend:
    * Builds query: "latest news in <city>"
    * Calls SERP API
    * Transforms response
    * Logs search
    * Returns minimal structured data

This protects API keys and centralizes logging.

## User Mobile App (Expo)
### Screens
* Login / Register
* Dashboard
### Dashboard features:
* Search news by entering city on search
* Display results
* Open article link

### State management:
* Secure token storage
* sessionId tracking
* Centralized API layer

## Admin Dashboard

Built with Expo (web + mobile).

I created Admin dashboard using same code using Expo, as in task it mentioned to use React.js or next.js for admin, In React native official documentation, as React Native Cli is deprecated the official documentation suggest to use vite, next.js or expo to create project. I choose expo because I can share code with web and mobile.

### Screens:

* Users List
* Search Logs
* Sessions

### Focus:

* Clean data tables
* Protected admin routes
* Minimal UI, functional clarity

## Error Handling & Security
* Centralized backend error middleware
* Zod validation
* Password hashing (bcrypt)
* Role-based access control
* Environment variables for secrets
* No direct third-party exposure to frontend

## Key Implementation Focus
* Clean system design
* Accurate session lifecycle handling
* Secure authentication integration
* Proper relational data modeling
* Clear documentation

## Conclusion
* This solution demonstrates:
* Full-stack architecture understanding
* Secure API integration
* Clean session tracking logic
* Structured backend design
* Production-style thinking within time constraints

The implementation prioritizes correctness, clarity, and maintainability over UI complexity, aligned with the evaluation criteria.