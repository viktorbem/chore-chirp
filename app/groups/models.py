from bson import ObjectId
from flask import current_app


class Group:
    def __init__(self, group_data):
        self.id = group_data['_id']
        self.title = group_data['title']
        self.tasks = group_data['tasks']
        self.position = group_data['position']
        self.user = group_data['user_id']

    def update_tasks(self, tasks):
        self.tasks = tasks
        current_app.db.groups.update_one({'_id': self.id}, {'$set': {'tasks': self.tasks}})

    @staticmethod
    def create_group(user, title):
        position = 0
        stored_groups = Group.get_groups_by_user(user)
        if stored_groups:
            position = len(stored_groups)
        group_data = {
            'title': title,
            'tasks': [],
            'position': position,
            'user_id': user.id
        }
        new_group = current_app.db.groups.insert_one(group_data)
        if new_group:
            group_data['_id'] = new_group.inserted_id
            return Group(group_data)

        return None

    @staticmethod
    def get_group_by_id(group_id):
        group_data = current_app.db.groups.find_one({'_id': ObjectId(group_id)})
        if group_data:
            return Group(group_data)

        return None

    @staticmethod
    def get_groups_by_user(user):
        groups = current_app.db.groups.find({'user_id': user.id})
        if groups:
            return [Group(group_data) for group_data in groups]

        return []
