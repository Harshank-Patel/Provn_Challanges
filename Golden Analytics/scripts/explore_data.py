from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))

db = client["financial_ai"]

print("\nSample Document:")
print(db.transactions.find_one())

print("\nTop 10 Agencies:")

pipeline = [
    {
        "$group": {
            "_id": "$agency",
            "count": {"$sum": 1}
        }
    },
    {
        "$sort": {"count": -1}
    },
    {
        "$limit": 10
    }
]

for row in db.transactions.aggregate(pipeline):
    print(row)