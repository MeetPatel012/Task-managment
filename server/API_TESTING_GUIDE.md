# API Testing Guide - Smart Team Task Manager

## 🚀 Quick Start

Your server is already running on `http://localhost:5000`

---

## Method 1: Using VS Code REST Client Extension (Recommended)

### Step 1: Install Extension

1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "REST Client" by Huachao Mao
3. Install it

### Step 2: Use the test file below

Save this as `api-tests.http` in your server folder and click "Send Request" above each request.

---

## Method 2: Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import the requests below
3. Create an environment variable `token` to store your JWT

---

## Method 3: Using cURL (Command Line)

Copy and paste the commands below into your terminal.

---

## 📝 Complete Test Flow

### 1️⃣ AUTHENTICATION

#### Register a New User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**cURL:**

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **📋 Copy the `token` from the response - you'll need it for all other requests!**

---

#### Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**cURL:**

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

---

#### Get Current User Profile

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 2️⃣ PROJECTS

#### Create a Project

```http
POST http://localhost:5000/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "color": "#3b82f6",
  "startDate": "2025-12-01",
  "dueDate": "2026-03-01"
}
```

**cURL:**

```bash
curl -X POST http://localhost:5000/api/projects -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"name\":\"Website Redesign\",\"description\":\"Complete redesign of company website\",\"color\":\"#3b82f6\"}"
```

> **📋 Copy the project `_id` from the response!**

---

#### Get All Projects

```http
GET http://localhost:5000/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
```

**With filters:**

```http
GET http://localhost:5000/api/projects?status=active&search=website&page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/projects -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Get Project by ID

```http
GET http://localhost:5000/api/projects/PROJECT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Update Project

```http
PATCH http://localhost:5000/api/projects/PROJECT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "color": "#10b981"
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:5000/api/projects/PROJECT_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"name\":\"Updated Project Name\",\"color\":\"#10b981\"}"
```

---

#### Archive Project

```http
DELETE http://localhost:5000/api/projects/PROJECT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3️⃣ TASKS

#### Create Task in TODO Column

```http
POST http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Design homepage mockup",
  "description": "Create high-fidelity mockups for the new homepage",
  "status": "todo",
  "priority": "high",
  "tags": ["design", "ui"],
  "dueDate": "2025-12-15"
}
```

**cURL:**

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"title\":\"Design homepage mockup\",\"status\":\"todo\",\"priority\":\"high\"}"
```

> **📋 Copy the task `_id` from the response!**

---

#### Create More Tasks (for Kanban testing)

```http
POST http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Setup database schema",
  "status": "todo",
  "priority": "medium"
}
```

```http
POST http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Implement authentication",
  "status": "in_progress",
  "priority": "high"
}
```

---

#### Get All Tasks for a Project

```http
GET http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks
Authorization: Bearer YOUR_TOKEN_HERE
```

**With filters:**

```http
GET http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks?status=todo&search=design
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_ID_HERE/tasks -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Get Task by ID

```http
GET http://localhost:5000/api/tasks/TASK_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/tasks/TASK_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Update Task

```http
PATCH http://localhost:5000/api/tasks/TASK_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "urgent",
  "subtasks": [
    {
      "title": "Research design patterns",
      "isCompleted": false
    },
    {
      "title": "Create wireframes",
      "isCompleted": true
    }
  ]
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"title\":\"Updated task title\",\"priority\":\"urgent\"}"
```

---

#### 🎯 Reorder Task (Kanban Drag & Drop)

**Move task from TODO to IN_PROGRESS:**

```http
PATCH http://localhost:5000/api/tasks/TASK_ID_HERE/reorder
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "in_progress",
  "order": 0
}
```

**Move task to different position in same column:**

```http
PATCH http://localhost:5000/api/tasks/TASK_ID_HERE/reorder
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "todo",
  "order": 2
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID_HERE/reorder -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"status\":\"in_progress\",\"order\":0}"
```

---

#### Delete Task

```http
DELETE http://localhost:5000/api/tasks/TASK_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4️⃣ MEMBER MANAGEMENT

#### Add Member to Project

```http
POST http://localhost:5000/api/projects/PROJECT_ID_HERE/members
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "userId": "USER_ID_TO_ADD",
  "role": "member"
}
```

**Roles:** `owner`, `manager`, `member`, `viewer`

**cURL:**

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID_HERE/members -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"userId\":\"USER_ID_HERE\",\"role\":\"member\"}"
```

---

#### Remove Member from Project

```http
DELETE http://localhost:5000/api/projects/PROJECT_ID_HERE/members/USER_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID_HERE/members/USER_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Complete Testing Workflow

### Step-by-Step Test Sequence:

1. **Register** a user → Get token
2. **Login** (optional, you already have token)
3. **Create a project** → Get project ID
4. **Create 3-4 tasks** in different statuses → Get task IDs
5. **Get all tasks** to see the Kanban board
6. **Reorder a task** (move from TODO to IN_PROGRESS)
7. **Get all tasks again** to verify the order changed
8. **Update a task** (add subtasks, change priority)
9. **Delete a task**

---

## 💡 Pro Tips

### For VS Code REST Client:

- Use variables to avoid repeating values:

```http
@baseUrl = http://localhost:5000
@token = YOUR_TOKEN_HERE
@projectId = YOUR_PROJECT_ID

GET {{baseUrl}}/api/projects/{{projectId}}
Authorization: Bearer {{token}}
```

### For Postman:

- Create an environment with variables:
  - `baseUrl`: `http://localhost:5000`
  - `token`: (paste your JWT token)
  - `projectId`: (paste project ID)
  - `taskId`: (paste task ID)

### For cURL:

- Save your token in a variable:

```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:5000/api/projects -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "Not authorized, no token provided"

- Make sure you're including the `Authorization: Bearer YOUR_TOKEN` header
- Check that the token is valid (not expired)

### Error: "Project not found"

- Verify the project ID is correct
- Make sure you're using the `_id` field from the create response

### Error: "Access denied"

- You might not be a member of the project
- Check if you're the owner/manager for operations that require it

### Server not responding?

- Check if the server is running: `npm run dev`
- Verify MongoDB is running
- Check the server console for errors

---

## 📊 Expected Kanban Board Structure

After creating tasks, your board should look like:

```
TODO              IN_PROGRESS       DONE
─────────────────────────────────────────
Task 1 (order:0)  Task 4 (order:0)  Task 6 (order:0)
Task 2 (order:1)  Task 5 (order:1)  Task 7 (order:1)
Task 3 (order:2)
```

When you reorder Task 1 to IN_PROGRESS at position 1:

```
TODO              IN_PROGRESS       DONE
─────────────────────────────────────────
Task 2 (order:0)  Task 4 (order:0)  Task 6 (order:0)
Task 3 (order:1)  Task 1 (order:1)  Task 7 (order:1)
                  Task 5 (order:2)
```

---

---

### 5️⃣ COMMENTS

#### Get All Comments for a Task

```http
GET http://localhost:5000/api/tasks/TASK_ID_HERE/comments
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/tasks/TASK_ID_HERE/comments -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### Create a Comment

```http
POST http://localhost:5000/api/tasks/TASK_ID_HERE/comments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "content": "This task is looking great! Let's proceed with the implementation."
}
```

**cURL:**

```bash
curl -X POST http://localhost:5000/api/tasks/TASK_ID_HERE/comments -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"content\":\"This task is looking great!\"}"
```

> **📋 Copy the comment `_id` from the response if you want to reply to it!**

---

#### Reply to a Comment (Nested Comment)

```http
POST http://localhost:5000/api/tasks/TASK_ID_HERE/comments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "content": "Thanks for the feedback!",
  "parentComment": "PARENT_COMMENT_ID_HERE"
}
```

**cURL:**

```bash
curl -X POST http://localhost:5000/api/tasks/TASK_ID_HERE/comments -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"content\":\"Thanks for the feedback!\",\"parentComment\":\"PARENT_COMMENT_ID_HERE\"}"
```

---

#### Delete a Comment

```http
DELETE http://localhost:5000/api/comments/COMMENT_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X DELETE http://localhost:5000/api/comments/COMMENT_ID_HERE -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

> **Note:** Only the comment author or an admin can delete a comment.

---

### 6️⃣ DASHBOARD

#### Get Dashboard Overview

```http
GET http://localhost:5000/api/dashboard/overview
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/dashboard/overview -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "projectsCount": 5,
    "tasksAssignedCount": 12,
    "tasksByStatus": {
      "todo": 4,
      "in_progress": 6,
      "done": 2
    },
    "upcomingTasks": [
      {
        "_id": "...",
        "title": "Design homepage mockup",
        "status": "in_progress",
        "priority": "high",
        "dueDate": "2025-12-05T00:00:00.000Z",
        "project": {
          "name": "Website Redesign",
          "color": "#3b82f6"
        }
      }
    ]
  }
}
```

---

## ✅ Health Check

Before testing, verify the server is running:

```http
GET http://localhost:5000/api/health
```

**Expected Response:**

```json
{
  "ok": true
}
```

---

Happy Testing! 🚀
