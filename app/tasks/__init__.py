from flask import Blueprint, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.tasks.forms import AddTaskForm
from app.tasks.models import Task

tasks = Blueprint('tasks', __name__, template_folder='templates')


# Frontend routes

@tasks.route('/add', methods=['GET', 'POST'])
@login_required
def add_task():
    form = AddTaskForm()
    if form.validate_on_submit():
        title = form.title.data
        description = form.description.data
        group_id = form.group_id.data

        new_task = Task.create_task(current_user.id, title, description, group_id)
        return redirect(url_for('routes.index'))

    form.group_id.data = request.args.get('group_id', '')
    return render_template('add-task.html', form=form)


# API routes

@tasks.route('/update', methods=['POST'])
def update_tasks():
    data = request.get_json()

    if data.get('user_id') != current_user.id:
        return jsonify({'error': 'You are not allowed to update the tasks'}), 403

    updates = data.get('updates', [])
    updates_count = len(updates)
    if updates_count == 0:
        return jsonify({'error': 'There are no tasks to be updated'}), 403

    updated_count = 0
    for update in updates:
        task_id = update.pop('task_id')
        result = Task.update_one(task_id, update)
        updated_count += result.modified_count

    if updated_count == updates_count:
        return jsonify({'success': f'All {updates_count} tasks successfully updated'}), 200

    return jsonify({'success': f'Successfully updated {updated_count} of {updates_count} tasks'}), 200
