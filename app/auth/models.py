from flask import current_app
from flask_login import UserMixin
from bson import ObjectId


class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.email = user_data['email']
        self.password = user_data['password']

    def get_id(self):
        return self.id

    @staticmethod
    def get_user_by_email(email):
        user_data = current_app.db.users.find_one({'email': email})
        if user_data:
            return User(user_data)

        return None

    @staticmethod
    def get_user_by_id(user_id):
        user_data = current_app.db.users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            return User(user_data)

        return None

    @staticmethod
    def create_user(email, password):
        user_data = {
            'email': email,
            'password': password
        }
        new_user = current_app.db.users.insert_one(user_data)
        if new_user:
            user_data['_id'] = new_user.inserted_id
            return User(user_data)

        return None
