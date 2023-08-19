from datetime import datetime

from bson import ObjectId
from flask import current_app
from flask_login import current_user

from app.helpers import get_group_title, get_date_formatted, get_user_email


class Task:
    def __init__(self, task_data):
        self.id = task_data['_id']
        self.title = task_data['title']
        self.description = task_data['description']
        self.group_id = task_data['group_id']
        self.position = task_data['position']
        self.user_id = task_data['user_id']
        self.created_at = task_data['created_at']
        self.last_update = task_data.get('last_update', None)

    @classmethod
    def create_task(cls, user_id, title, description, group_id):
        group_tasks = cls.get_tasks_by_group(group_id)
        position = 0
        if len(group_tasks) > 0:
            last_task = group_tasks.pop()
            position = last_task.position + 1
        task_data = {
            'title': title,
            'description': description,
            'group_id': group_id,
            'position': position,
            'user_id': user_id,
            'created_at': datetime.now()
        }
        new_task = current_app.db.tasks.insert_one(task_data)
        if new_task:
            task_data['_id'] = new_task.inserted_id
            return cls(task_data)

        return None

    @classmethod
    def get_task_by_id(cls, task_id):
        task_data = current_app.db.tasks.find_one({'_id': ObjectId(task_id)})
        if task_data:
            return cls(task_data)

        return None

    @classmethod
    def get_tasks_by_group(cls, group_id):
        tasks = current_app.db.tasks.find({'group_id': str(group_id)}).sort('position', 1)
        if tasks:
            return [cls(task_data) for task_data in tasks]

        return []

    @classmethod
    def get_tasks_by_user(cls, user_id):
        tasks = current_app.db.tasks.find({'user_id': user_id})
        if tasks:
            return [cls(task_data) for task_data in tasks]

        return []

    @classmethod
    def get_task_metadata(cls, task_id):
        if task_id:
            task = cls.get_task_by_id(task_id)
            if task:
                last_update = task.last_update
                if last_update:
                    last_update = get_date_formatted(last_update)

                return [
                    ('Group', get_group_title(task.group_id)),
                    ('Owner', get_user_email(task.user_id)),
                    ('Created at', get_date_formatted(task.created_at)),
                    ('Last update', last_update),
                    ('Task ID', task.id)
                ]

        return [
            ('Owner', get_user_email(current_user.id)),
            ('Created at', get_date_formatted(datetime.now()))
        ]

    @staticmethod
    def update_one(task_id, payload):
        return current_app.db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': payload}
        )

    @staticmethod
    def remove_one(task_id):
        return current_app.db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': {'archived': True, 'group_id': None}}
        )
