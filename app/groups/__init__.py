from flask import Blueprint, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.groups.forms import AddGroupForm
from app.groups.models import Group

groups = Blueprint('groups', __name__, template_folder='templates')


# Frontend routes

@groups.route('/add', methods=['GET', 'POST'])
@login_required
def add_group():
    form = AddGroupForm()
    if form.validate_on_submit():
        title = form.title.data

        new_group = Group.create_group(current_user.id, title)
        return redirect(url_for('routes.index'))

    return render_template('add-group.html', form=form)


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
