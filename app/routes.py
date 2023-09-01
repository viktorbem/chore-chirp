from flask import Blueprint, redirect, render_template, url_for
from flask_login import login_required, current_user

from app.blueprints.groups.models import Group
from app.blueprints.chores.models import Chore

routes = Blueprint('routes', __name__)


@routes.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('routes.home'))

    return redirect(url_for('user.signup'))


@routes.route('/home')
@login_required
def home():
    groups = Group.get_groups_by_user(current_user.id)
    for group in groups:
        group.chore_objects = Chore.get_chores_by_group(group.id)

    return render_template('views/home.j2', groups=groups)
