from bson import ObjectId
from flask import current_app


class Group:
    def __init__(self, group_data):
        self.id = group_data.get('_id')
        self.title = group_data.get('title')
        self.position = group_data.get('position')
        self.user_id = group_data.get('user_id')

    @classmethod
    def create_group(cls, user_id, title):
        user_groups = cls.get_groups_by_user(user_id)
        position = 0
        if len(user_groups) > 0:
            last_group = user_groups.pop()
            position = last_group.position + 1
        group_data = {
            'title': title,
            'position': position,
            'user_id': user_id
        }
        new_group = current_app.db.groups.insert_one(group_data)
        if new_group:
            group_data['_id'] = new_group.inserted_id
            return cls(group_data)

        return None

    @classmethod
    def get_group_by_id(cls, group_id):
        group_data = current_app.db.groups.find_one({'_id': ObjectId(group_id)})
        if group_data:
            return cls(group_data)

        return None

    @classmethod
    def get_groups_by_user(cls, user_id):
        groups = current_app.db.groups.find({'user_id': user_id}).sort('position', 1)
        if groups:
            return [cls(group_data) for group_data in groups]

        return []

    @staticmethod
    def update_one(group_id, payload):
        return current_app.db.groups.update_one(
            {'_id': ObjectId(group_id)},
            {'$set': payload}
        )

    @staticmethod
    def remove_one(group_id):
        return current_app.db.groups.delete_one({'_id': ObjectId(group_id)})
