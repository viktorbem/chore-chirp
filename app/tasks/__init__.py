from datetime import datetime

from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.tasks.forms import AddTaskForm, EditTaskForm
from app.tasks.models import Task

from app.helpers import get_group_choices

tasks = Blueprint('tasks', __name__, template_folder='templates')


# Frontend routes

@tasks.route('/add', methods=['GET', 'POST'])
@login_required
def add_task():
    group_choices = get_group_choices(current_user.id)
    form = AddTaskForm(group_choices=group_choices)

    if form.validate_on_submit():
        title = form.title.data
        group_id = form.group.data
        description = form.description.data

        new_task = Task.create_task(current_user.id, title, description, group_id)
        return redirect(url_for('routes.index'))

    form.group.data = request.args.get('group_id', '')

    metadata = Task.get_task_metadata(None)
    return render_template('views/task-add.html', form=form, metadata=metadata)


@tasks.route('/edit/<task_id>', methods=['GET', 'POST'])
@login_required
def edit_task(task_id):
    task = Task.get_task_by_id(task_id)
    if not task:
        flash('Requested task was not found.', 'warning')
        return redirect(url_for('routes.index'))

    if task.user_id != current_user.id:
        flash('You are not allowed to edit this task', 'warning')
        return redirect(url_for('tasks.view_task', task_id=task_id))

    group_choices = get_group_choices(current_user.id)
    form = EditTaskForm(group_choices=group_choices)

    if form.validate_on_submit():
        update = {
            'title': form.title.data,
            'group': form.group.data,
            'description': form.description.data,
            'last_update': datetime.now()
        }

        # TODO: Create a history module and save every update in it

        result = Task.update_one(task_id, update)
        if result.modified_count == 0:
            flash('Changes could not be saved. Please try again later.', 'danger')
        else:
            flash('All changes were saved.', 'success')

        return redirect(url_for('tasks.view_task', task_id=task_id))

    form.title.data = task.title
    form.group.data = task.group_id
    form.description.data = task.description

    metadata = Task.get_task_metadata(task.id)
    return render_template('views/task-edit.html', form=form, metadata=metadata, task=task)


@tasks.route('/remove/<task_id>')
@login_required
def remove_task(task_id):
    task = Task.get_task_by_id(task_id)
    if not task or task.user_id != current_user.id:
        flash('You are not allowed to delete this task.', 'warning')
        return redirect(url_for('tasks.view_task', task_id=task_id))

    result = Task.remove_one(task_id)
    if result.modified_count == 0:
        flash('The task was not deleted. Please try again later.', 'danger')
    else:
        flash('The task was successfully deleted.', 'success')

    return redirect(url_for('routes.index'))


@tasks.route('/<task_id>')
@login_required
def view_task(task_id):
    task = Task.get_task_by_id(task_id)
    if not task:
        flash('Requested task was not found.', 'warning')
        return redirect(url_for('routes.index'))

    if task.user_id != current_user.id:
        flash('You are not allowed to view this task', 'warning')
        return redirect(url_for('routes.index'))

    metadata = Task.get_task_metadata(task.id)
    return render_template('views/task.html', metadata=metadata, task=task)


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
