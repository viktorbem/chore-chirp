from flask import Blueprint, render_template
from flask_login import login_required, current_user

from app.groups.models import Group
from app.tasks.models import Task

routes = Blueprint('routes', __name__)


@routes.route('/')
@login_required
def index():
    groups = Group.get_groups_by_user(current_user.id)
    for group in groups:
        group.task_objects = Task.get_tasks_by_group(group.id)

    return render_template('index.html', groups=groups)
