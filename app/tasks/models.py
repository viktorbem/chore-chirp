from bson import ObjectId
from flask import current_app
from datetime import datetime

# TODO: We need to remove this to keep this module independent
from app.groups.models import Group


class Task:
    def __init__(self, task_data):
        self.id = str(task_data['_id'])
        self.title = task_data['title']
        self.description = task_data['description']
        self.group = task_data['group']
        self.user = task_data['user_id']
        self.created_at = task_data['created_at']

    @staticmethod
    def create_task(user, title, description, group_id):
        current_group = Group.get_group_by_id(group_id)
        if not current_group:
            return None

        group_tasks = [task for task in current_group.tasks]
        task_data = {
            'title': title,
            'description': description,
            'group': group_id,
            'position': len(group_tasks),
            'user_id': user.id,
            'created_at': datetime.now()
        }
        new_task = current_app.db.tasks.insert_one(task_data)
        if new_task:
            task_data['_id'] = new_task.inserted_id
            group_tasks.append(new_task.inserted_id)
            current_group.update_tasks(group_tasks)
            return Task(task_data)

        return None

    @staticmethod
    def get_task_by_id(task_id):
        task_data = current_app.db.tasks.find_one({'_id': ObjectId(task_id)})
        if task_data:
            return Task(task_data)

        return None

    @staticmethod
    def get_tasks_by_user(user):
        tasks = current_app.db.tasks.find({'user_id': user.id})
        if tasks:
            return [Task(task_data) for task_data in tasks]

        return []
