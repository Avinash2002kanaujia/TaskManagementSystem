Task Management System

A full-stack Project & Task Management System inspired by simplified Jira/Trello workflows.

The system supports team-based project management, Kanban task tracking, sprints, comments, attachments, dashboards, JWT authentication, and local AI-assisted task generation.

Project status: Core backend and frontend functionality is implemented and tested locally. The latest frontend changes have been committed and pushed to master.

Latest commit: 7010c68 — Polish frontend task management UI

1. Project Overview

The Task Management System is designed for teams to create projects, manage tasks, organize work into sprints, collaborate through comments, upload task attachments, and track progress through a Kanban board.

The project was originally defined in the Project Requirements Document (PRD-TMS-2026-001, Version 1.3) as a simplified Jira/Trello-style platform.

Main workflow

User
  ↓
Team
  ↓
Project
  ↓
Sprint
  ↓
Tasks
  ↓
To Do → In Progress → Testing → Done

Backward movement between statuses is supported when rework is required.

2. Team

Member

Responsibility

Denish Murawala

Frontend / React UI / Kanban / Dashboard

Avinash Kanaujia

Backend API / Authentication / SQL / MongoDB / Swagger

Anushtup Ganguly

DevOps / Azure / Data / Attachments / Testing

3. Technology Stack

Frontend

React

Vite

React Router

Axios

CSS

Responsive task-management UI

Backend

ASP.NET Core Web API

C#

.NET 10.0

Entity Framework Core

JWT Bearer Authentication

BCrypt password hashing

Swagger / OpenAPI

Global exception handling

REST APIs

Databases

Microsoft SQL Server

Entity Framework Core / SQL Server provider

MongoDB for task comments

File Storage

Azure Blob Storage

Private blob container for task attachments

AI

Ollama

qwen2.5:7b

Local AI task generation

Structured JSON task generation

Development Tools

VS Code

JetBrains Rider

Docker

Git / GitHub

DBeaver

SQL Server Management tools where applicable

4. Architecture

The application follows a layered architecture:

┌───────────────────────────────┐
│        React Frontend         │
│          Vite + React         │
└───────────────┬───────────────┘
                │ HTTP / REST
                ▼
┌───────────────────────────────┐
│      ASP.NET Core Web API     │
│           Controllers         │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐  ┌─────────────────┐
│ Application   │  │ Infrastructure  │
│ Services/DTOs │  │ EF/Mongo/Blob   │
└───────┬───────┘  └────────┬────────┘
        │                   │
        ▼          ┌────────┼─────────┐
┌───────────────┐  ▼        ▼         ▼
│    Domain     │ SQL     MongoDB   Azure Blob
│   Entities    │ Server
└───────────────┘

Backend projects

TaskManagementSystem/
├── TaskManagement.API/
├── TaskManagement.Application/
├── TaskManagement.Domain/
├── TaskManagement.Infrastructure/
├── frontend/
└── TaskManagement.slnx

Layer responsibilities

TaskManagement.Domain

Contains:

Entities

Enums

Core business models

Important entities:

User

Team

TeamMember

Project

Sprint

TaskItem

SubTask

Attachment

TaskManagement.Application

Contains:

DTOs

Service interfaces

Application-level contracts

Authentication/application logic

TaskManagement.Infrastructure

Contains:

Entity Framework Core

SQL Server persistence

MongoDB integration

Azure Blob Storage integration

Service implementations

TaskManagement.API

Contains:

Controllers

Dependency injection

JWT configuration

CORS

Swagger

Exception handling

HTTP API configuration

frontend

Contains:

React application

Authentication UI

Dashboard

Teams

Projects

Tasks

Kanban board

Task details

Comments

Subtasks

Attachments

5. Features Completed So Far

5.1 Authentication

Implemented:

User registration

User login

JWT authentication

Authenticated profile endpoint

BCrypt password hashing

JWT claims for user identity

Protected API endpoints

Token expiration handling

Endpoints include:

POST /api/Auth/register
POST /api/Auth/login
GET  /api/Auth/profile

5.2 Teams

Implemented:

Create team

Automatically make team creator an admin

Add team members

Retrieve user's teams

Retrieve a specific team

Team member information

Team roles

Admin-only member management

Authorization checks

Example role structure:

Team
├── Admin
├── Member
├── Member
└── Member

A non-admin team member cannot add other members.

5.3 Projects

Implemented:

Create projects

Projects belong to teams

Retrieve projects

Project-based task management

Team membership validation

Example:

Backend Team
└── Task Management System

5.4 Sprints

Implemented:

Create sprint

Retrieve project sprints

Activate sprint

Deactivate sprint

Active sprint handling

Sprint/project relationship

Team membership validation

Current local test data includes:

Sprint 1
Goal:
Implement authentication, teams, projects and
initial task management features

5.5 Tasks

Implemented:

Create task

Retrieve project tasks

Task title

Description

Acceptance criteria

Priority

Assignee

Due date

Sprint assignment

Status management

Project/team authorization

Task status workflow

Statuses

1 → To Do
2 → In Progress
3 → Testing
4 → Done

Priorities

1 → Low
2 → Medium
3 → High
4 → Critical

5.6 Kanban Board

The frontend provides a Kanban-style task board:

┌─────────┬──────────────┬─────────┬──────┐
│  To Do  │ In Progress  │ Testing │ Done │
├─────────┼──────────────┼─────────┼──────┤
│ Task A  │ Task C       │ Task D  │Task E│
│ Task B  │              │         │      │
└─────────┴──────────────┴─────────┴──────┘

Implemented:

Four status columns

Task cards

Task counts

Priority badges

Assignee information

Sprint information

Task details modal

Status movement

Empty/loading states

Responsive UI

5.7 Task Details

Clicking a task opens a detailed task view.

The task detail view includes:

Task title

Description

Priority

Status

Assignee

Sprint

Due date

Acceptance criteria

Subtasks

Comments

Attachments

5.8 Subtasks

Implemented:

Create subtasks

Retrieve task subtasks

Mark subtasks complete/incomplete

Persist subtask state

Display completion state in the task details UI

Endpoints:

POST  /api/SubTask/task/{taskId}
GET   /api/SubTask/task/{taskId}
PATCH /api/SubTask/{id}

5.9 Comments

Comments are stored in MongoDB.

Implemented:

Add task comments

Retrieve task comments

Persist comments across page refreshes

Display comment author

Display comment timestamp

Validate task/team access

Endpoints:

POST /api/Comment/task/{taskId}
GET  /api/Comment/task/{taskId}

MongoDB document structure includes:

ObjectId
TaskId
UserId
UserName
Content
CreatedAt

5.10 Attachments

Azure Blob Storage is used for task file storage.

Implemented:

Upload attachment

Store attachment metadata in SQL Server

Download attachment

Delete attachment

Display attachments inside task details

Private blob container

Endpoints:

POST   /api/attachment/task/{taskId}
GET    /api/attachment/task/{taskId}
GET    /api/attachment/{id}/download
DELETE /api/attachment/{id}

Storage design:

SQL Server
    │
    └── Attachment metadata

Azure Blob Storage
    │
    └── Actual uploaded files

5.11 Dashboard

Implemented:

Task counts by status

Project/task overview

Dashboard cards

Sprint/project information

Task progress visualization

5.12 AI Task Generation

An additional local AI feature has been implemented using Ollama.

Model

qwen2.5:7b

The model runs locally through:

http://127.0.0.1:11434

Implemented:

Generate task information from a title/prompt

Generate description

Generate acceptance criteria

Generate subtasks

Structured JSON response

Validation and limits on generated content

Create task through AI-assisted workflow

Endpoints:

POST /api/Ai/generate-task
POST /api/Ai/create-task

This AI functionality is an enhancement added during implementation. The original PRD did not require OpenAI integration and explicitly stated that OpenAI integration was not part of the original phase. The current implementation uses local Ollama instead.

6. Database Design

SQL Server

SQL Server stores the main relational application data.

Current entities include:

Users
Teams
TeamMembers
Projects
Sprints
Tasks
SubTasks
Attachments

Relationships include:

User
 └── TeamMember

Team
 ├── TeamMembers
 └── Projects

Project
 ├── Sprints
 └── Tasks

Sprint
 └── Tasks

Task
 ├── SubTasks
 └── Attachments

Database

Local development database:

TaskManagementDb

An Entity Framework Core migration has been created and applied:

20260930072255_InitialCreate

7. MongoDB

MongoDB is used for task comments.

Local development configuration:

MongoDB
Host: localhost
Port: 27017

The project uses a MongoDB container for local development.

8. Azure Blob Storage

Azure Blob Storage is used for uploaded task attachments.

The blob container is private.

The application stores:

SQL Server
    → attachment metadata

Azure Blob Storage
    → actual file

The current local implementation has successfully tested:

Upload

Listing

Download

Delete

9. Authentication & Security

Implemented security measures include:

JWT Bearer authentication

[Authorize] protected endpoints

BCrypt password hashing

Team membership authorization

Admin-only team member operations

Input validation

Global exception handling

Problem Details responses

Private blob storage

CORS configuration for local frontend development

Important

Do not commit:

appsettings.Development.json
.env
JWT secrets
Database passwords
Azure storage keys
MongoDB credentials

Use environment variables, Secret Manager, or deployment-specific configuration for secrets.

10. Global Exception Handling

A global exception handler has been implemented.

Current mapping:

UnauthorizedAccessException
        ↓
HTTP 401

InvalidOperationException
        ↓
HTTP 400

Unhandled Exception
        ↓
HTTP 500

The API returns Problem Details responses instead of exposing unnecessary internal implementation details.

11. Swagger / API Documentation

Swagger is enabled for the API.

Local Swagger URL:

http://localhost:5265/swagger

JWT-protected endpoints can be tested by:

Registering/logging in.

Copying the returned access token.

Clicking Authorize in Swagger.

Entering:

Bearer <access-token>

Calling protected endpoints.

12. Local Development Setup

Prerequisites

Install:

.NET SDK

Node.js

npm

Docker

SQL Server

MongoDB

Git

For the current implementation:

.NET SDK: 10.x
Node.js: 25.x

The original PRD specified ASP.NET Core 8, while the current implementation targets net10.0.

13. Clone the Repository

git clone https://github.com/Avinash2002kanaujia/TaskManagementSystem.git
cd TaskManagementSystem

14. Backend Setup

Restore dependencies:

dotnet restore TaskManagement.slnx

Build:

dotnet build TaskManagement.slnx

Run the API:

dotnet run --project TaskManagement.API

The current development API runs on:

http://localhost:5265

Swagger:

http://localhost:5265/swagger

15. Frontend Setup

Move into the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The current Vite development frontend runs on:

http://localhost:5174

Build the frontend for production:

npm run build

16. SQL Server with Docker

The local development environment uses SQL Server in Docker.

Example:

docker ps

Expected SQL Server container:

sqlserver

SQL Server port:

1433

Database:

TaskManagementDb

Apply migrations:

dotnet ef database update \
  --project TaskManagement.Infrastructure \
  --startup-project TaskManagement.API

Do not run destructive database commands against unrelated databases such as an existing StudentManagementDB.

17. MongoDB with Docker

The local development setup uses MongoDB 7.

Example container:

mongodb-taskmanagement

Port:

27017

Check:

docker ps

18. Ollama AI Setup

Install/start Ollama and make sure the Ollama server is running.

Check:

ollama list

The project currently uses:

qwen2.5:7b

Start the server if required:

ollama serve

Verify the service:

http://127.0.0.1:11434

The AI feature will not work if the Ollama server is not running.

19. Environment Configuration

Connection strings and secrets should be supplied through local/deployment configuration rather than committed to Git.

Typical configuration areas include:

{
  "ConnectionStrings": {
    "DefaultConnection": "<SQL_SERVER_CONNECTION_STRING>"
  },
  "MongoDb": {
    "ConnectionString": "<MONGODB_CONNECTION_STRING>",
    "DatabaseName": "<MONGODB_DATABASE>"
  },
  "AzureBlob": {
    "ConnectionString": "<AZURE_STORAGE_CONNECTION_STRING>",
    "ContainerName": "<BLOB_CONTAINER>"
  },
  "Jwt": {
    "Key": "<JWT_SECRET>"
  }
}

Use the exact configuration keys expected by the current application when setting up a new environment.

20. API Modules

Current API modules include:

/api/Auth
/api/Team
/api/Project
/api/Sprint
/api/Task
/api/SubTask
/api/Comment
/api/Attachment
/api/Ai

The exact routes and request/response models are available through Swagger.

21. Current Project Structure

TaskManagementSystem/
│
├── TaskManagement.API/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Program.cs
│   └── TaskManagement.API.csproj
│
├── TaskManagement.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   └── TaskManagement.Application.csproj
│
├── TaskManagement.Domain/
│   ├── Entities/
│   ├── Enums/
│   └── TaskManagement.Domain.csproj
│
├── TaskManagement.Infrastructure/
│   ├── Data/
│   ├── Services/
│   ├── Migrations/
│   └── TaskManagement.Infrastructure.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── TaskManagement.slnx
└── README.md

22. Current Implementation Checklist

Authentication

Register

Login

JWT authentication

Profile

Password hashing

Teams

Create team

Add members

Team roles

Admin authorization

Team membership validation

Projects

Create project

Team/project relationship

Project listing

Sprints

Create sprint

List sprints

Activate sprint

Deactivate sprint

Assign tasks to sprint

Tasks

Create task

Task description

Acceptance criteria

Priority

Assignee

Due date

Status

Sprint assignment

Kanban

To Do

In Progress

Testing

Done

Task counts

Task cards

Task details

Subtasks

Create

List

Complete/incomplete

Persistence

Comments

Create

List

MongoDB persistence

Timestamp

Author information

Attachments

Upload

List

Download

Delete

SQL metadata

Azure Blob Storage

Dashboard

Status counts

Project/task overview

Sprint information

AI

Local Ollama integration

AI task generation

Description generation

Acceptance criteria generation

Subtask generation

AI-assisted task creation

Quality

Swagger

Global exception handling

CORS

Frontend production build

Backend build

Git diff validation

GitHub repository

23. Verification Performed

The latest implementation was verified with:

Frontend

npm run build

Result:

✓ 89 modules transformed.
✓ built in 1.89s

Backend

dotnet build TaskManagement.slnx

Result:

TaskManagement.Domain       succeeded
TaskManagement.Application  succeeded
TaskManagement.Infrastructure succeeded
TaskManagement.API          succeeded

Build succeeded

Git

The working tree is clean and the latest commit has been pushed to GitHub.

7010c68 Polish frontend task management UI

24. Current Git Status

Repository:

https://github.com/Avinash2002kanaujia/TaskManagementSystem

Branch:

master

Latest commit:

7010c68 Polish frontend task management UI

Current status:

master is up to date with origin/master
working tree clean

25. Original PRD Completion Status

The original PRD requested:

Three users and one shared team/project

Tasks moving through all four statuses

Persistent comments

File upload/download

Dashboard status counts

README and API documentation

Azure deployment

Testing and final demo

Currently demonstrated locally

Authentication

Shared team/project workflow

Four task statuses

Persistent comments

File upload

File download

File deletion

Dashboard

Swagger/API documentation

README

Local production builds

Still to be completed/verified

Final Azure deployment

Production HTTPS configuration

Azure App Service deployment

React deployment to Azure Static Web Apps/App Service

Azure SQL production configuration

Production MongoDB Atlas/Cosmos configuration

Production Blob Storage configuration

End-to-end production testing

Final trainer demo/presentation

26. Planned Production Architecture

The target Azure deployment from the PRD is:

                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │  React Frontend │
              │ Azure Static Web│
              │      Apps       │
              └────────┬────────┘
                       │ HTTPS
                       ▼
              ┌─────────────────┐
              │ ASP.NET Core API│
              │  Azure App      │
              │    Service      │
              └────────┬────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
     Azure SQL     MongoDB       Azure Blob
                    Atlas/          Storage
                    Cosmos

27. Development Workflow

Recommended workflow:

# Pull latest code
git pull origin master

# Backend
dotnet restore TaskManagement.slnx
dotnet build TaskManagement.slnx

# Frontend
cd frontend
npm install
npm run build
npm run dev

Before committing:

git diff --check
git status

Commit:

git add .
git commit -m "Your commit message"

Push:

git push origin master

28. Important Notes

Never commit passwords, JWT secrets, Azure storage keys, or database credentials.

Make sure SQL Server and MongoDB are running before testing database-dependent features.

Make sure Ollama is running before testing AI functionality.

The frontend currently runs on port 5174.

The API currently runs on port 5265 during local development.

Swagger should be used to inspect and test the API contracts.

Production deployment requires HTTPS and production-specific secret/configuration management.

The current implementation targets .NET 10.0 even though the original PRD specified ASP.NET Core 8.

29. Project Status

Current stage: Core development completed locally; production deployment and final end-to-end verification remain.

The project currently contains a working full-stack task-management workflow with:

Authentication
     ↓
Teams
     ↓
Projects
     ↓
Sprints
     ↓
Tasks
     ↓
Kanban Board
     ↓
Task Details
 ┌───┼─────────────┐
 ▼   ▼             ▼
Subtasks Comments Attachments
                    │
                    ▼
              Azure Blob

The backend builds successfully, the frontend production build succeeds, and the latest frontend implementation has been committed and pushed to GitHub.
