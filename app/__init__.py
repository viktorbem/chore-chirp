import os
import uuid

from dotenv import load_dotenv
from flask import Flask
from flask_login import LoginManager
from pymongo import MongoClient

from .auth import auth
from .models.user import User
from .routes import routes

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = uuid.uuid4().hex

    # MongoDB initialization and configuration
    app.config['MONGODB_URI'] = os.environ.get('MONGODB_URI')
    app.db = MongoClient(app.config['MONGODB_URI']).get_database('taskman')

    # LoginManager initialization and configuration
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'You need to be logged in.'
    login_manager.login_message_category = 'warning'

    @login_manager.user_loader
    def load_user(user_id):
        return User.get_user_by_id(user_id)

    # Blueprints
    app.register_blueprint(routes)
    app.register_blueprint(auth)

    return app
