# Provn Challenge

AI-powered public spending analytics platform built with MongoDB Atlas, FastAPI, OpenAI GPT-5, and React.

## Overview

Provn Challenge enables users to explore large government spending datasets using natural language.

Instead of writing SQL queries or manually filtering data, users can simply ask questions such as:

- Largest agencies
- Top vendors for Commerce
- Show transportation spending by category
- Which vendors receive the most money?

The application translates natural-language questions into structured analytics queries, executes those queries against a MongoDB dataset, and presents the results through interactive visualizations and dashboards.

---

## Key Features

### AI-Powered Query Translation

Users can ask questions in plain English.

Example:

**Question**

```text
show transportation spending by category
```

**AI Generated Query**

```json
{
  "filters": {
    "agency": "Transportation"
  },
  "group_by": [
    "category"
  ],
  "limit": 10
}
```

### Dynamic Analytics

Supports:

- Agency analysis
- Vendor analysis
- Category analysis
- Filtering
- Aggregation
- Ranking

Example queries:

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
show transportation spending by category
```

### Interactive Dashboard

The React frontend provides:

- Natural language search
- Summary KPI cards
- Spending visualizations
- Interactive charts
- Analytics tables
- AI query transparency

### Metadata-Aware AI

The AI is dynamically grounded using actual database metadata:

- Agencies
- Categories
- Fiscal Years

This improves query accuracy and minimizes hallucinations.

---

## Dataset

The source data contains Washington State public spending transactions.

Example schema:

| Field | Description |
|---------|-------------|
| Bien | Biennium |
| FY | Fiscal Year |
| Month | Month |
| Agency | Agency Name |
| Category | Spending Category |
| Vendor | Vendor Name |
| Amount | Transaction Amount |

Dataset Highlights:

- 451,000+ transactions
- 100+ agencies
- Multiple fiscal years
- Billions of dollars in spending data

---

## Architecture

```text
User Question
      │
      ▼
GPT-5 Query Translator
      │
      ▼
QuerySpec JSON
      │
      ▼
MongoDB Aggregation Pipeline
      │
      ▼
FastAPI Backend
      │
      ▼
React Dashboard
```

---

## Technology Stack

### Backend

- Python
- FastAPI
- MongoDB Atlas
- PyMongo
- OpenAI API

### Frontend

- React
- TypeScript
- Vite
- Recharts

### Infrastructure

- MongoDB Atlas
- GitHub

---

## Project Structure

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
│   └── src/
│       ├── App.tsx
│       ├── services/
│       └── components/
│           └── ResultsChart.tsx
│
├── scripts/
├── data/
├── docs/
├── README.md
├── .gitignore
└── .env
```

---

## Development Environment

### Conda Environment

```bash
conda create -n provn_ai python=3.11 pip
conda activate provn_ai
```

### Backend Dependencies

```bash
pip install fastapi uvicorn pymongo dnspython openai python-dotenv pandas
```

### Frontend Dependencies

```bash
npm install
npm install recharts
```

---

## Running the Application

### Start Backend

```bash
uvicorn backend.app:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

### Start Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
```

---

## Current Milestones

### Phase 1 – Data Foundation

- MongoDB Atlas setup
- CSV ingestion pipeline
- Data validation
- Index creation

### Phase 2 – Analytics Engine

- Dynamic aggregation pipelines
- Vendor analytics
- Agency analytics
- Category analytics
- Query API

### Phase 3 – AI Layer

- GPT-5 integration
- Natural language query translation
- Metadata-aware prompting
- Query validation

### Phase 4 – Visualization

- React dashboard
- Natural language search
- KPI cards
- Interactive charts
- Query transparency

---

## Future Enhancements

- Conversational follow-up questions
- Query history
- Saved dashboards
- User authentication
- Multi-year trend analysis
- Executive summaries
- Spending anomaly detection
- PDF export
- Advanced filtering

---

## Goal

Enable non-technical users to explore complex public spending datasets through a conversational AI interface without requiring SQL knowledge or analytics expertise.

This project demonstrates how large language models can bridge the gap between natural language and structured analytics, making government spending data accessible to everyone.