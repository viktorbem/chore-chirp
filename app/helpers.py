from datetime import datetime

from bson import ObjectId
from flask import current_app


def get_date_formatted(timestamp, pattern='%Y-%m-%d %H:%M'):
    if not timestamp:
        timestamp = datetime.now()

    return timestamp.strftime(pattern)


def get_group_choices(user_id):
    group_choices = []
    groups = current_app.db.groups.find({'user_id': user_id}).sort('title', 1)
    if groups:
        group_choices = [(str(group['_id']), group['title']) for group in groups]

    return group_choices


def get_group_tasks_count(group_id):
    return current_app.db.tasks.count_documents({'group_id': str(group_id)})


def get_group_title(group_id):
    group = current_app.db.groups.find_one({'_id': ObjectId(group_id)})
    if group:
        return group['title']

    return 'N/A'


def get_user_email(user_id):
    user = current_app.db.users.find_one({'_id': ObjectId(user_id)})
    if user:
        return user['email']

    return 'N/A'
