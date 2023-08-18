from bson import ObjectId
from flask import current_app


class Group:
    def __init__(self, group_data):
        self.id = group_data['_id']
        self.title = group_data['title']
        self.position = group_data['position']
        self.user_id = group_data['user_id']

    @classmethod
    def update_one(cls, group_id, payload):
        return current_app.db.groups.update_one(
            {'_id': ObjectId(group_id)},
            {'$set': payload}
        )

    @staticmethod
    def create_group(user_id, title):
        user_groups = Group.get_groups_by_user(user_id)
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
            return Group(group_data)

        return None

    @staticmethod
    def get_group_by_id(group_id):
        group_data = current_app.db.groups.find_one({'_id': ObjectId(group_id)})
        if group_data:
            return Group(group_data)

        return None

    @staticmethod
    def get_groups_by_user(user_id):
        groups = current_app.db.groups.find({'user_id': user_id}).sort('position', 1)
        if groups:
            return [Group(group_data) for group_data in groups]

        return []
