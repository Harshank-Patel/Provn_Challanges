from pydantic import BaseModel
from typing import Optional, Dict, List


class QuerySpec(BaseModel):
    filters: Optional[Dict] = {}
    group_by: Optional[List[str]] = []

    metric: Optional[str] = "sum"
    metric_field: Optional[str] = "amount"

    sort_by: Optional[str] = "metric"
    sort_order: Optional[str] = "desc"

    limit: Optional[int] = 10