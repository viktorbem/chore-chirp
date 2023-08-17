from flask import Blueprint, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.tasks.forms import AddTaskForm
from app.tasks.models import Task

tasks = Blueprint('tasks', __name__, template_folder='templates')


@tasks.route('/add', methods=['GET', 'POST'])
@login_required
def add_task():
    form = AddTaskForm()
    if form.validate_on_submit():
        title = form.title.data
        description = form.description.data
        group = form.group.data

        new_task = Task.create_task(current_user, title, description, group)
        return redirect(url_for('routes.index'))

    form.group.data = request.args.get('group_id', '')
    return render_template('add-task.html', form=form)
