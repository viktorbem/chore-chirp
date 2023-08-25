from flask import Blueprint, render_template
from flask_login import login_required, current_user

from app.blueprints.groups.models import Group
from app.blueprints.chores.models import Chore

routes = Blueprint('routes', __name__)


@routes.route('/')
@login_required
def index():
    groups = Group.get_groups_by_user(current_user.id)
    for group in groups:
        group.chore_objects = Chore.get_chores_by_group(group.id)

    return render_template('index.html', groups=groups)
