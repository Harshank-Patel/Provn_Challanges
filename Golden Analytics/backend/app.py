from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.summarizer import summarize
from backend.schemas import QuerySpec
from backend.analytics import execute_query
from backend.database import transactions
from backend.translator import translate

app = FastAPI(
    title="Provn Challenge API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "Provn Challenge",
        "status": "running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "documents": transactions.count_documents({})
    }


@app.get("/metadata")
def metadata():

    return {
        "agencies": transactions.distinct("agency"),
        "categories": transactions.distinct("category"),
        "years": transactions.distinct("fy")
    }


@app.post("/query")
def query_data(query: QuerySpec):

    return {
        "results": execute_query(query)
    }


@app.get("/top-agencies")
def top_agencies():

    pipeline = [
        {
            "$group": {
                "_id": "$agency",
                "totalAmount": {
                    "$sum": "$amount"
                },
                "transactionCount": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "totalAmount": -1
            }
        },
        {
            "$limit": 10
        }
    ]

    return {
        "results": list(
            transactions.aggregate(pipeline)
        )
    }


# @app.post("/ask")
# def ask(payload: dict):

#     spec = translate(
#         payload["question"]
#     )

#     query = QuerySpec(**spec)

#     results = execute_query(query)

#     print("QUERY COMPLETE")

#     return {
#         "question": payload["question"],
#         "query": spec,
#         "results": results,
#         "summary": "AI summary disabled"
#     }

@app.post("/ask")
def ask(payload: dict):

    spec = translate(
        payload["question"]
    )

    query = QuerySpec(**spec)

    results = execute_query(query)

    print("QUERY COMPLETE")

    summary = summarize(
        payload["question"],
        results
    )

    print("SUMMARY COMPLETE")

    return {
        "question": payload["question"],
        "query": spec,
        "results": results,
        "summary": summary
    }