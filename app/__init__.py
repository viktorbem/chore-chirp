import os
import uuid

from dotenv import load_dotenv
from flask import Flask
from flask_login import LoginManager
from pymongo import MongoClient

from .helpers import parse_markdown
from .routes import routes

from app.blueprints.chores import chores
from app.blueprints.comments import comments
from app.blueprints.groups import groups

from app.blueprints.user import user
from app.blueprints.user.models import User

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
    login_manager.login_view = 'user.login'
    login_manager.login_message = 'You need to be logged in.'
    login_manager.login_message_category = 'warning'

    @login_manager.user_loader
    def load_user(user_id):
        return User.get_user_by_id(user_id)

    # Blueprints
    app.register_blueprint(user)
    app.register_blueprint(chores, url_prefix='/chores')
    app.register_blueprint(comments, url_prefix='/comments')
    app.register_blueprint(groups, url_prefix='/groups')
    app.register_blueprint(routes)

    # Custom jinja filters
    app.jinja_env.filters['markdown'] = parse_markdown

    return app
