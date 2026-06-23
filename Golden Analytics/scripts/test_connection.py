from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(
    os.getenv("MONGODB_URI")
)

print("Connected!")

print(client.list_database_names())