from backend.database import transactions


def get_metadata():

    return {
        "agencies": sorted(
            transactions.distinct("agency")
        ),
        "categories": sorted(
            transactions.distinct("category")
        )
    }