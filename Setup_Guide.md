# Provn Challenge - Setup Guide

# GitHub Repo - https://github.com/Harshank-Patel/Provn_Challanges
## Author: Harshank Patel 
## Email: Harshank.TAMU@gmail.com

## Overview
Provn Challenge is an AI-powered public spending analytics platform that allows users to explore government spending data using natural language.

Technology Stack:

- React + TypeScript
- FastAPI
- MongoDB Atlas
- OpenAI GPT-5
- Recharts

This guide explains how to set up the database, environment variables, dependencies, and run the application locally.

---

# Prerequisites

Install the following:

## Python

Version:

```text
Python 3.11+
```

## Conda

Recommended:

```text
Anaconda
```

or

```text
Miniconda
```

## Node.js

Version:

```text
Node.js 18+
```

Verify installation:

```bash
node -v
npm -v
```

---

# Project Structure

```text
provn_challenge/

├── backend/
│   ├── app.py
│   ├── analytics.py
│   ├── database.py
│   ├── metadata.py
│   ├── schemas.py
│   ├── summarizer.py
│   └── translator.py
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── scripts/
│   └── import_data.py
│
├── data/
│
├── docs/
│
├── .env
├── start.sh
├── README.md
└── SETUP_GUIDE.md
```

---

# Create Python Environment

Create environment:

```bash
conda create -n provn_ai python=3.11 -y
```

Activate:

```bash
conda activate provn_ai
```

---

# Install Backend Dependencies

```bash
pip install \
fastapi \
uvicorn \
pymongo \
dnspython \
openai \
python-dotenv \
pandas
```

---

# Install Frontend Dependencies

Navigate to frontend:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Install charting library:

```bash
npm install recharts
```

Return to project root:

```bash
cd ..
```

---

# MongoDB Atlas Setup

## Create Atlas Cluster

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Add your IP address to Network Access.
5. Copy the connection string.

Example:

```text
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

# Create Environment Variables

Create:

```text
.env
```

in the project root.

Add:

```env
# MongoDB Connection

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

DB_NAME=financial_ai

COLLECTION_NAME=transactions

# OpenAI

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

IMPORTANT:

Do not commit `.env` to source control.

Ensure `.gitignore` contains:

```text
.env
```

---

# Database Setup

The application expects a MongoDB database populated with public spending transactions.

Database:

```text
financial_ai
```

Collection:

```text
transactions
```

---

# CSV Dataset

Place source CSV files into:

```text
data/
```

Example:

```text
data/

├── FY2020.csv
├── FY2021.csv
└── FY2022.csv
```

Expected columns:

```text
FY
Month
Agency
Vendor
Category
Amount
```

The importer will normalize and load the data into MongoDB Atlas.

---

# Import CSV Data

Run:

```bash
python scripts/import_data.py
```

Import Process:

```text
CSV Files
     ↓
Pandas DataFrame
     ↓
Data Cleaning
     ↓
MongoDB Atlas
```

The script:

- Reads CSV files
- Cleans column names
- Converts amounts to numeric values
- Loads records into MongoDB Atlas

---

# Verify Import

Check MongoDB Atlas:

Database:

```text
financial_ai
```

Collection:

```text
transactions
```

Or run:

```bash
curl http://localhost:8000/health
```

Expected:

```json
{
  "status": "healthy",
  "documents": 451029
}
```

Document count should match imported records.

---

# Optional Indexes

For better performance:

```javascript
db.transactions.createIndex({ agency: 1 })

db.transactions.createIndex({ vendor: 1 })

db.transactions.createIndex({ category: 1 })

db.transactions.createIndex({ fy: 1 })
```

---

# Running the Backend

Activate environment:

```bash
conda activate provn_ai
```

Start FastAPI:

```bash
uvicorn backend.app:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

# Running the Frontend

Open a second terminal:

```bash
cd frontend

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# Optional Startup Script

Run:

```bash
./start.sh
```

The script:

1. Activates the Conda environment
2. Starts FastAPI
3. Starts React
4. Displays application URLs

---

# Sample Queries

Try the following:

```text
largest agencies
```

```text
top vendors for commerce
```

```text
top vendors for ecology
```

```text
top vendors for corrections
```

```text
show transportation spending by category
```

---

# AI Workflow

The platform uses a two-stage AI pipeline.

### Step 1: Query Translation

User asks:

```text
top vendors for commerce
```

GPT translates the question into:

```json
{
  "filters": {
    "agency": "Commerce"
  },
  "group_by": [
    "vendor"
  ],
  "limit": 10
}
```

### Step 2: Analytics Execution

MongoDB executes the generated aggregation query.

### Step 3: AI Insights

GPT analyzes the returned results and generates executive-level insights.

Example:

```text
Commerce spending is concentrated among a small number of vendors.
The leading vendor received significantly more funding than other recipients.
```

---

# Troubleshooting

## Missing OpenAI Credentials

Verify:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

exists inside:

```text
.env
```

Verify:

```python
load_dotenv()
```

is called before:

```python
os.getenv("OPENAI_API_KEY")
```

---

## MongoDB Connection Errors

Verify:

```env
MONGODB_URI
```

is correct.

Ensure:

- Atlas cluster is running
- Network access is configured
- Database user credentials are valid

---

## Frontend Cannot Reach Backend

Verify backend is running:

```text
http://localhost:8000/docs
```

Verify frontend API points to:

```text
http://localhost:8000
```

---

# Project Summary

Provn Challenge demonstrates how Large Language Models can bridge the gap between natural language and structured analytics.

Users can ask questions in plain English, GPT-5 translates those questions into MongoDB aggregation queries, and the platform returns visual analytics and AI-generated insights without requiring SQL or business intelligence expertise.