from datetime import datetime

from bson import ObjectId
from flask import current_app
from flask_login import UserMixin, login_user


class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data.get('_id'))
        self.email = user_data.get('email')
        self.password = user_data.get('password')
        self.created_at = user_data.get('created_at')
        self.last_login = user_data.get('last_login')
        self.last_update = user_data.get('last_update')
        self.theme = user_data.get('theme', 'light')

    def get_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'created_at': self.email,
            'last_login': self.last_login,
            'theme': self.theme,
        }

    def get_id(self):
        return self.id

    def login(self):
        User.update_one(self.id, {'last_login': datetime.now()})
        login_user(self)

    @classmethod
    def get_user_by_email(cls, email):
        user_data = current_app.db.users.find_one({'email': email})
        if user_data:
            return cls(user_data)

        return None

    @classmethod
    def get_user_by_id(cls, user_id):
        user_data = current_app.db.users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            return cls(user_data)

        return None

    @classmethod
    def create_user(cls, email, password, theme):
        user_data = {
            'email': email,
            'password': password,
            'created_at': datetime.now(),
            'theme': theme
        }
        new_user = current_app.db.users.insert_one(user_data)
        if new_user:
            user_data['_id'] = new_user.inserted_id
            return cls(user_data)

        return None

    @staticmethod
    def update_one(user_id, payload):
        return current_app.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': payload}
        )
