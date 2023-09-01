from flask import Blueprint, flash, jsonify, redirect, request, url_for
from flask_login import current_user, login_required

from app.blueprints.groups.models import Group

from app.helpers import get_group_chores_count

groups = Blueprint('groups', __name__, template_folder='templates')


# Frontend routes

@groups.route('/add')
@login_required
def add_group():
    # TODO: It might be fun to use some API to randomly generate group titles
    new_group = Group.create_group(current_user.id, 'Untitled group')
    if not new_group:
        flash('New group could not be added. Please try again later.', 'warning')
    else:
        flash('New group has been added.', 'success')

    return redirect(url_for('routes.index'))


@groups.route('/remove/<group_id>')
@login_required
def remove_group(group_id):
    group = Group.get_group_by_id(group_id)
    if not group or group.user_id != current_user.id:
        flash('You are not allowed to delete this group.', 'warning')
        return redirect(url_for('routes.index'))

    chore_count = get_group_chores_count(group_id)
    if chore_count > 0:
        flash('The group could not be deleted, because it\'s not empty.', 'warning')
        return redirect(url_for('routes.index'))

    result = Group.remove_one(group_id)
    if result.deleted_count == 0:
        flash('The group was not deleted. Please try again later.', 'danger')
    else:
        flash('The group was successfully deleted.', 'success')

    return redirect(url_for('routes.index'))


# API routes

@groups.route('/update', methods=['POST'])
def update_groups():
    data = request.get_json()

    if data.get('user_id') != current_user.id:
        return jsonify({'error': 'You are not allowed to update the groups'}), 403

    updates = data.get('updates', [])
    updates_count = len(updates)
    if updates_count == 0:
        return jsonify({'error': 'There are no groups to be updated'}), 403

    updated_count = 0
    for update in updates:
        group_id = update.pop('group_id')
        result = Group.update_one(group_id, update)
        updated_count += result.modified_count

    if updated_count == updates_count:
        return jsonify({'success': f'All {updates_count} groups successfully updated'}), 200

    return jsonify({'success': f'Successfully updated {updated_count} of {updates_count} groups'}), 200
