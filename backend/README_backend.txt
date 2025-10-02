# Logistics & Invoice CMS - Backend README

This document provides detailed, step-by-step instructions for setting up and running the Python FastAPI backend on a local Windows machine.

## 1. Prerequisites

-   **Python**: Ensure you have Python 3.7 or newer installed. You can download it from [python.org](https://www.python.org/downloads/). During installation, make sure to check the box that says "Add Python to PATH".
-   **Terminal**: You will need a command-line interface. Windows Command Prompt, PowerShell, or Windows Terminal will work.

---

## 2. Step-by-Step Setup Instructions

### Step 1: Convert Source Code Files

The backend source code is provided in `.txt` format for compatibility reasons. The first step is to convert them all to standard Python (`.py`) files.

1.  Open your terminal (e.g., Command Prompt or PowerShell).
2.  Navigate to the `backend` directory of the project.
    ```cmd
    cd path\to\your\project\backend
    ```
3.  Run the following command to rename all `.txt` files to `.py`:

    -   If using **Command Prompt**:
        ```cmd
        ren *.txt *.py
        ```
    -   If using **PowerShell**:
        ```powershell
        Get-ChildItem -Filter *.txt | Rename-Item -NewName { $_.Name.Replace(".txt", ".py") }
        ```

    After this step, you should see files like `main.py`, `models.py`, etc., in the `backend` directory.

### Step 2: Set Up a Python Virtual Environment

A virtual environment is a self-contained directory tree that contains a Python installation for a particular version of Python, plus a number of additional packages. It's the standard way to manage project dependencies.

1.  While still in the `backend` directory, create a new virtual environment named `venv`:
    ```cmd
    python -m venv venv
    ```
2.  Activate the virtual environment. You must do this every time you open a new terminal to work on the project.
    ```cmd
    .\venv\Scripts\activate
    ```
    You will know it's active because your terminal prompt will change to show `(venv)` at the beginning.

### Step 3: Install Dependencies

Install all the required Python packages from the `requirements.txt` file.

1.  With your virtual environment active, run:
    ```cmd
    pip install -r requirements.txt
    ```
    This will install FastAPI, Uvicorn, SQLAlchemy, and other necessary libraries into your virtual environment.

### Step 4: Run the Backend Server

Now you can start the local development server.

1.  Run the following command in the `backend` directory:
    ```cmd
    python -m uvicorn main:app --reload
    ```
    -   `main`: refers to the `main.py` file.
    -   `app`: refers to the `FastAPI()` instance created inside `main.py`.
    -   `--reload`: makes the server restart automatically after you save any code changes.

2.  You should see output indicating the server is running, typically on `http://127.0.0.1:8000`. The first time you run this command, a database file named `sql_app.db` will be created in the `backend` directory.

### Step 5: (Optional) Initialize and Seed the Database

To populate the database with realistic sample data, run the `seed_data.py` script. This will delete any existing data and create a fresh set.

1.  Make sure your virtual environment is active.
2.  From the `backend` directory, run:
    ```cmd
    python seed_data.py
    ```
    This will create a set of customers, drivers, jobs, and invoices so you can test the application immediately.

---

## 3. How to Test the API

### Interactive API Docs (Swagger UI)

The easiest way to explore and test the API is using the built-in documentation.

1.  With the server running, open a web browser and navigate to:
    [**http://127.0.0.1:8000/docs**](http://127.0.0.1:8000/docs)
2.  This page allows you to see all available endpoints, view their schemas (request and response formats), and execute API calls directly from your browser.

### Example `curl` Requests

You can also use a command-line tool like `curl` to interact with the API.

-   **Get all jobs:**
    ```sh
    curl -X GET "http://127.0.0.1:8000/jobs/"
    ```

-   **Create a new job (example payload):**
    ```sh
    curl -X POST "http://127.0.0.1:8000/jobs/" -H "Content-Type: application/json" -d "{\"mainSource\": \"Internal\",\"company\": \"Global Imports Inc.\",\"awbRef\": \"AWB-NEW-001\",\"pickupAddress\": \"123 Pickup Ln, London, EC1A 1AA\",\"deliveryAddress\": \"456 Delivery Rd, Manchester, M1 1BB\",\"finalRate\": 250.00,\"customerId\": 2}"
    ```

-   **Mark job with ID 1 as completed (this will trigger invoice creation):**
    ```sh
    curl -X POST "http://127.0.0.1:8000/jobs/1/complete"
    ```

-   **Get all invoices:**
    ```sh
    curl -X GET "http://127.0.0.1:8000/invoices/"
    ```
-   **Record a payment for invoice with ID 1:**
    ```sh
    curl -X POST "http://127.0.0.1:8000/invoices/1/payments" -H "Content-Type: application/json" -d "{\"amount\": 100.00}"
    ```