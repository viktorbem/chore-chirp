from datetime import datetime

from bson import ObjectId
from flask import current_app

from app.helpers import get_date_formatted, get_user_email, parse_markdown


class Comment:
    def __init__(self, comment_data):
        self.id = comment_data.get('_id')
        self.body = comment_data.get('body')
        self.chore_id = comment_data.get('chore_id')
        self.user_id = comment_data.get('user_id')
        self.created_at = comment_data.get('created_at')
        self.last_update = comment_data.get('last_update')
        self.hidden = comment_data.get('hidden', False)

    def get_dict(self):
        return {
            'id': str(self.id),
            'body': parse_markdown(self.body),
            'raw_body': self.body,
            'chore_id': self.chore_id,
            'user': get_user_email(self.user_id),
            'user_id': self.user_id,
            'created_at': get_date_formatted(self.created_at),
            'last_update': get_date_formatted(self.last_update),
            'hidden': self.hidden
        }

    def save_changes(self, payload):
        payload['last_update'] = datetime.now()
        for prop in payload.keys():
            setattr(self, prop, payload[prop])

        return current_app.db.comments.update_one(
            {'_id': ObjectId(self.id)},
            {'$set': payload}
        )

    @classmethod
    def create_comment(cls, user_id, chore_id, body):
        comment_data = {
            'body': body,
            'user_id': user_id,
            'chore_id': chore_id,
            'created_at': datetime.now()
        }
        new_comment = current_app.db.comments.insert_one(comment_data)
        if new_comment:
            comment_data['_id'] = new_comment.inserted_id
            return cls(comment_data)

        return None

    @classmethod
    def get_comment_by_id(cls, comment_id):
        comment_data = current_app.db.comments.find_one({'_id': ObjectId(comment_id)})
        if comment_data:
            return cls(comment_data)

        return None

    @classmethod
    def get_comments_by_chore(cls, chore_id):
        comments = current_app.db.comments.find({'chore_id': chore_id})
        if comments:
            return [cls(comment_data) for comment_data in comments]

        return []

    @staticmethod
    def update_one(comment_id, payload):
        return current_app.db.comments.update_one(
            {'_id': ObjectId(comment_id)},
            {'$set': payload}
        )
