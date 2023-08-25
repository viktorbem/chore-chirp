from datetime import datetime

from bson import ObjectId
from flask import current_app
from flask_login import current_user

from app.helpers import get_group_title, get_date_formatted, get_user_email


class Chore:
    def __init__(self, chore_data):
        self.id = chore_data.get('_id')
        self.title = chore_data.get('title')
        self.description = chore_data.get('description')
        self.group_id = chore_data.get('group_id')
        self.position = chore_data.get('position')
        self.user_id = chore_data.get('user_id')
        self.created_at = chore_data.get('created_at')
        self.last_update = chore_data.get('last_update')

    @classmethod
    def create_chore(cls, user_id, title, description, group_id):
        group_chores = cls.get_chores_by_group(group_id)
        position = 0
        if len(group_chores) > 0:
            last_chore = group_chores.pop()
            position = last_chore.position + 1
        chore_data = {
            'title': title,
            'description': description,
            'group_id': group_id,
            'position': position,
            'user_id': user_id,
            'created_at': datetime.now()
        }
        new_chore = current_app.db.chores.insert_one(chore_data)
        if new_chore:
            chore_data['_id'] = new_chore.inserted_id
            return cls(chore_data)

        return None

    @classmethod
    def get_chore_by_id(cls, chore_id):
        chore_data = current_app.db.chores.find_one({'_id': ObjectId(chore_id)})
        if chore_data:
            return cls(chore_data)

        return None

    @classmethod
    def get_chores_by_group(cls, group_id):
        chores = current_app.db.chores.find({'group_id': str(group_id)}).sort('position', 1)
        if chores:
            return [cls(chore_data) for chore_data in chores]

        return []

    @classmethod
    def get_chores_by_user(cls, user_id):
        chores = current_app.db.chores.find({'user_id': user_id})
        if chores:
            return [cls(chore_data) for chore_data in chores]

        return []

    @classmethod
    def get_chores_metadata(cls, chore_id):
        if chore_id:
            chore = cls.get_chore_by_id(chore_id)
            if chore:
                last_update = chore.last_update
                if last_update:
                    last_update = get_date_formatted(last_update)

                return [
                    ('Group', get_group_title(chore.group_id)),
                    ('Owner', get_user_email(chore.user_id)),
                    ('Created at', get_date_formatted(chore.created_at)),
                    ('Last update', last_update),
                    ('Chore ID', chore.id)
                ]

        return [
            ('Owner', get_user_email(current_user.id)),
            ('Created at', get_date_formatted(datetime.now()))
        ]

    @staticmethod
    def update_one(chore_id, payload):
        return current_app.db.chores.update_one(
            {'_id': ObjectId(chore_id)},
            {'$set': payload}
        )

    @staticmethod
    def remove_one(chore_id):
        return current_app.db.chores.update_one(
            {'_id': ObjectId(chore_id)},
            {'$set': {'archived': True, 'group_id': None}}
        )
