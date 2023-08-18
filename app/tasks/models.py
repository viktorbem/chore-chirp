from bson import ObjectId
from datetime import datetime
from flask import current_app


class Task:
    def __init__(self, task_data):
        self.id = task_data['_id']
        self.title = task_data['title']
        self.description = task_data['description']
        self.group_id = task_data['group_id']
        self.position = task_data['position']
        self.user_id = task_data['user_id']
        self.created_at = task_data['created_at']

    @classmethod
    def update_one(cls, task_id, payload):
        return current_app.db.tasks.update_one(
            {'_id': ObjectId(task_id)},
            {'$set': payload}
        )

    @staticmethod
    def create_task(user_id, title, description, group_id):
        group_tasks = Task.get_tasks_by_group(group_id)
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
            return Task(task_data)

        return None

    @staticmethod
    def get_task_by_id(task_id):
        task_data = current_app.db.tasks.find_one({'_id': ObjectId(task_id)})
        if task_data:
            return Task(task_data)

        return None

    @staticmethod
    def get_tasks_by_group(group_id):
        tasks = current_app.db.tasks.find({'group_id': str(group_id)}).sort('position', 1)
        if tasks:
            return [Task(task_data) for task_data in tasks]

        return []

    @staticmethod
    def get_tasks_by_user(user_id):
        tasks = current_app.db.tasks.find({'user_id': user_id})
        if tasks:
            return [Task(task_data) for task_data in tasks]

        return []
