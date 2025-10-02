# ⚠️ Critical Stability Rules (Must-Read)

For every update (no matter what the new feature is), always follow these permanent stability rules. These are not one-time fixes but ongoing requirements to prevent future blank page errors, invalid date crashes, or data integrity issues.

1.  **Date Handling**: Always use `safeParseDate` and `safeDateFormat` from `utils/date.ts`. No component or function may call `new Date()` directly. All mock data and backend responses must provide valid ISO date strings or `null` (never empty strings). Forms must submit `null` instead of `""` if a date is not filled.
2.  **Defensive Rendering**: Always use optional chaining (`?.`) and fallback values when accessing nested objects (e.g., `invoice.customerDetails?.name || "N/A"`). Never assume customer, job, or payment details exist — show safe fallbacks instead.
3.  **Default Values**: New Jobs → default `created_at` = today. New Invoices → default `invoice_date` = today, `due_date` = today + 30 days. New Payments → default `payment_date` = today. Apply defaults consistently in backend and mock data.
4.  **Global Error Handling**: The application must be wrapped in an `<ErrorBoundary>` and include global `window.onerror` and `window.onunhandledrejection` handlers in `index.tsx` to ensure the app never shows a white screen.

---

# Logistics & Invoice CMS

## Version 5.1.1

## 1. Project Description

A comprehensive Content Management System for logistics and invoice management. This application allows for managing airway/haulage jobs, data entry, data management, invoicing, and reporting through a simple, tabbed admin interface. This project consists of a React frontend and a complete Python FastAPI backend running on PostgreSQL with Alembic for migrations.

---

## 2. Project Overview

### Frontend

This is a single-page application (SPA) built with React, TypeScript, and styled with Tailwind CSS. The application runs entirely in the browser and is currently operating with mock data.

-   **`index.html`**: The main HTML file. It sets up the basic document structure and mounts the React app.
-   **`App.tsx`**: The core component of the application, managing state, tab navigation, and rendering page components.
-   **`components/`**: Contains all reusable React components.
-   **`utils/`**: Contains shared utility functions, such as `safeDateFormat`.
-   **`types.ts`**: Contains all TypeScript type definitions and interfaces.
-   **`large-mock-data.ts`**: Contains a large, realistic dataset for testing.

### Backend

A complete backend is provided in the `/backend` directory. It is built with Python using FastAPI and SQLAlchemy ORM, designed for a PostgreSQL database.

-   **`backend/main.txt`**: The main FastAPI application file that initializes the app and includes the routers.
-   **`backend/database.txt`**: Contains the SQLAlchemy setup for the PostgreSQL database connection.
-   **`backend/models.txt`**: Defines the database table structures using SQLAlchemy's ORM.
-   **`backend/schemas.txt`**: Contains Pydantic models for data validation and serialization.
-   **`backend/crud.txt`**: Holds the core business logic and database interaction functions.
-   **`backend/security.txt`**: Handles all security aspects, including password hashing, JWT creation, and user/driver authentication dependencies.
-   **`backend/routers/`**: Contains API endpoint definitions, separated by resource (e.g., `jobs.txt`, `drivers.txt`).
-   **`backend/alembic/`**: Directory containing Alembic migration scripts and configuration.
-   **`backend/requirements.txt`**: A list of all required Python packages.

---

## 3. Backend Setup & Instructions

### Prerequisites

-   Python 3.7+ installed.
-   PostgreSQL server installed and running.
-   `pip` (Python package installer).

### Step 1: Set Up PostgreSQL Database

1.  Create a new PostgreSQL database for the application (e.g., `logistics_cms`).
2.  Create a database user with a secure password and grant it permissions to the new database.

### Step 2: Configure Environment Variables

1.  In the `backend` directory, create a file named `.env`.
2.  Add your database connection URL to this file. It should follow this format:
    ```
    DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
    ```
    Example: `DATABASE_URL=postgresql://logistics_user:supersecret@localhost:5432/logistics_cms`
3.  Also, add a secret key for JWT tokens:
    ```
    SECRET_KEY=a_very_secret_key_that_should_be_changed_for_production
    ```

### Step 3: Convert Backend Files & Install Dependencies

1.  Open a terminal and navigate to the `backend` directory.
2.  Convert all `.txt` files to `.py` files.
    -   On **Windows** (PowerShell):
        ```powershell
        Get-ChildItem -Filter *.txt | Rename-Item -NewName { $_.Name -replace '\.txt$','.py' }
        ```
    -   On **macOS/Linux**:
        ```bash
        for f in *.txt; do mv -- "$f" "${f%.txt}.py"; done
        ```
3.  Create and activate a Python virtual environment:
    ```sh
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
4.  Install all required packages:
    ```sh
    pip install -r requirements.txt
    ```

### Step 4: Run Database Migrations

Alembic is used to manage database schema changes.

1.  With your virtual environment active and `.env` file configured, run the following command from the `backend` directory to apply all migrations:
    ```sh
    alembic upgrade head
    ```
    This will create all the necessary tables in your PostgreSQL database.

### Step 5: Run the Backend Server

1.  While in the `/backend` directory, run:
    ```sh
    python -m uvicorn main:app --reload
    ```
2.  The server will start on `http://127.0.0.1:8000`.

---

## 4. Application Workflow (Frontend + Backend)

1.  **Multi-Role Authentication**: The application starts with a login screen with tabs for "Admin", "Driver", and "Customer". Each role has a separate authentication flow and uses a distinct API endpoint for login (`/token` for admins, `/drivers/token` for drivers). Sessions are maintained via a role-specific JWT token stored in `localStorage` (`admin_token` or `driver_token`).
2.  **Role-Based Access Control (RBAC)**:
    *   **Super Admin**: Has full, unrestricted access to all features, including user management, driver management, company settings, and backup/restore.
    -   **Admin**: A standard user with operational access for managing jobs, invoices, and credit notes. Restricted from sensitive areas.
    -   **Driver**: A new role with a dedicated login. After logging in, drivers are directed to a dedicated dashboard where they can view their assigned jobs and perform actions like updating status or uploading a Proof of Delivery (POD). They are denied access to all admin-level pages.
    -   **Customer**: This login is a placeholder and is not yet implemented.
3.  **Job Lifecycle Management**:
    *   **Creation**: Admins create jobs via the "Data Entry" page.
    *   **Assignment**: Admins assign jobs to available drivers.
    *   **Driver Actions (API)**: Drivers log in and can view their assigned jobs. They update the job status through the lifecycle: `ASSIGNED` → `EN_ROUTE` → `DELIVERED`.
    *   **Proof of Delivery (POD)**: Upon delivery, the driver uploads a POD image and an optional signature.
    *   **Completion & Invoicing**: Admins verify the delivered job and mark it as `COMPLETED`, which automatically generates an invoice.
4.  **Driver Location Tracking**: The system includes an endpoint for drivers to send location pings. This data is stored for 7 days and is automatically pruned by a daily cleanup task to ensure data privacy and performance.

---

## 5. Driver API Endpoints

A new set of endpoints has been created to support the driver workflow.

### Driver Authentication

-   **`POST /drivers/token`**: Driver login endpoint.
    -   **Request Body**: `username` (driver's email) and `password`.
    -   **Response**: JWT access token, similar to the admin login.

### Driver Management (Super Admin Only)

-   **`GET /drivers/`**: List all drivers.
-   **`POST /drivers/`**: Create a new driver.
-   **`PUT /drivers/{driver_id}`**: Update a driver's details (including password).
-   **`DELETE /drivers/{driver_id}`**: Delete a driver.

### Driver-Specific Endpoints (Driver Role Required)

-   **`GET /drivers/me/jobs`**: Get a list of all jobs assigned to the currently authenticated driver.
-   **`POST /jobs/{job_id}/accept`**: Driver accepts the job assignment. Changes status to `ASSIGNED`.
-   **`POST /jobs/{job_id}/en-route`**: Driver starts the journey. Changes status to `EN_ROUTE`.
-   **`POST /jobs/{job_id}/deliver`**: Driver has delivered the items. Changes status to `DELIVERED`.
-   **`POST /jobs/{job_id}/pod`**: Upload Proof of Delivery.
    -   **Request Body**: `pod_image` (file upload) and `pod_signature` (optional string).
    -   **Response**: Job details including the new `pod_image_url`.
-   **`POST /drivers/{driver_id}/locations`**: Driver sends a location ping.

---

## 6. Changelog

See the in-app Version History page for a complete and detailed changelog.
