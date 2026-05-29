from backend.database import transactions


def execute_query(query_spec):

    filters = query_spec.filters or {}
    group_by = query_spec.group_by or []
    limit = query_spec.limit or 10

    pipeline = []

    if filters:
        pipeline.append({
            "$match": filters
        })

    if group_by:

        group_id = {}

        for field in group_by:
            group_id[field] = f"${field}"

        pipeline.append({
            "$group": {
                "_id": group_id,
                "totalAmount": {
                    "$sum": "$amount"
                },
                "transactionCount": {
                    "$sum": 1
                }
            }
        })

        pipeline.append({
            "$sort": {
                "totalAmount": -1
            }
        })

        pipeline.append({
            "$limit": limit
        })

    results = list(
        transactions.aggregate(pipeline)
    )

    return results