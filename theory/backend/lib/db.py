INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [IndexModel([("timestamp", DESCENDING)], name="timestamp_desc")],
    "users": [IndexModel([("username", ASCENDING)], name="username", unique=True)],
    "activities": [IndexModel([("date", DESCENDING), ("created_at", DESCENDING)], name="date_created_desc")],
    "leaders": [IndexModel([("order", ASCENDING), ("name", ASCENDING)], name="order_name")],
    "members": [IndexModel([("angkatan", ASCENDING), ("full_name", ASCENDING)], name="angkatan_name")],
    "projects": [IndexModel([("date", DESCENDING), ("created_at", DESCENDING)], name="date_created_desc")],
    "site_content": [IndexModel([("key", ASCENDING)], name="key", unique=True)],
}