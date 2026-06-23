import os
from pymongo import MongoClient, InsertOne
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "financial_ai")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "transactions")

CSV_FILE = "data/Vendor-Payments_2021-23(FY 2022).csv"

BATCH_SIZE = 5000


def clean_record(row):
    return {
        "bien": str(row["Bien"]).strip(),
        "fy": int(row["FY"]),
        "month": int(row["FMonth"]),
        "agencyCode": int(row["Agy"]),
        "agency": str(row["Agency"]).strip(),
        "object": str(row["Object"]).strip(),
        "category": str(row["Category"]).strip(),
        "subobj": str(row["Subobj"]).strip(),
        "subcategory": str(row["SubCategory"]).strip(),
        "vendor": str(row["Vendor"]).strip(),
        "amount": float(row["Amount"])
    }


def main():
    print("Connecting to MongoDB...")

    client = MongoClient(MONGO_URI)

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    print("Reading CSV...")

    df = pd.read_csv(CSV_FILE)

    print(f"Rows found: {len(df):,}")

    operations = []
    inserted = 0

    for _, row in df.iterrows():
        operations.append(
            InsertOne(clean_record(row))
        )

        if len(operations) >= BATCH_SIZE:
            collection.bulk_write(operations)

            inserted += len(operations)

            print(f"Inserted {inserted:,}")

            operations = []

    if operations:
        collection.bulk_write(operations)

        inserted += len(operations)

    print(f"\nFinished.")
    print(f"Total inserted: {inserted:,}")

    print("\nCreating indexes...")

    collection.create_index("agency")
    collection.create_index("fy")
    collection.create_index("vendor")
    collection.create_index("category")
    collection.create_index([
        ("agency", 1),
        ("fy", 1)
    ])

    print("Indexes created.")

    print(
        "Document count:",
        collection.count_documents({})
    )


if __name__ == "__main__":
    main()