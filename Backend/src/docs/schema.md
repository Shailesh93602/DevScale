# Database Schema Documentation

## Overview

This document describes the database schema for the Learning Platform.

## Core Tables

### User

Stores user account information.

| Column     | Type     | Description          | Constraints          |
| ---------- | -------- | -------------------- | -------------------- |
| id         | String   | Primary key          | @id @default(cuid()) |
| email      | String   | User's email address | @unique              |
| username   | String   | Username             | @unique              |
| created_at | DateTime | Creation timestamp   | @default(now())      |
| updated_at | DateTime | Last update time     | @updatedAt           |

### Profile

Stores user profile information.

| Column | Type    | Description       | Constraints          |
| ------ | ------- | ----------------- | -------------------- |
| id     | String  | Primary key       | @id @default(cuid()) |
| userId | String  | Reference to User | @unique              |
| bio    | String? | User biography    |                      |
| avatar | String? | Avatar URL        |                      |

## Relationships

- One-to-One between User and Profile
- Many-to-Many between User and Roadmap
- One-to-Many between User and Article

## Indexes

Important indexes for performance:

- User.email
- Article.authorId
- Roadmap.userId
