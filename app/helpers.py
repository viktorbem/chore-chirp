from datetime import datetime
from html import unescape
import re

import bleach
from bson import ObjectId
from flask import current_app
from markdown import markdown


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


def parse_markdown(text):

    # TODO: Improve the extensions so that we can render checkboxes

    return markdown(text, extensions=['fenced_code', 'codehilite'])


def sanitize_markdown(text):

    def replace_entity(match):
        return unescape(match.group(0))

    tags = ['br']
    attributes = bleach.sanitizer.ALLOWED_ATTRIBUTES

    code_pattern = re.compile(r'```.*?```', re.DOTALL)
    sanitized_text = bleach.clean(text, tags=tags, attributes=attributes, strip=False)
    sanitized_text = code_pattern.sub(lambda match: re.sub(r'&\w+;', replace_entity, match.group(0)),
                                      sanitized_text)

    return sanitized_text
