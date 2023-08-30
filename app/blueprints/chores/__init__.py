from datetime import datetime

from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.blueprints.chores.forms import AddChoreForm, EditChoreForm
from app.blueprints.chores.models import Chore

from app.helpers import get_group_choices, sanitize_markdown

chores = Blueprint('chores', __name__, template_folder='templates')


# Frontend routes

@chores.route('/add', methods=['GET', 'POST'])
@login_required
def add_chore():
    group_choices = get_group_choices(current_user.id)
    form = AddChoreForm(group_choices=group_choices)

    if form.validate_on_submit():
        title = form.title.data
        group_id = form.group.data
        description = sanitize_markdown(form.description.data)

        new_chore = Chore.create_chore(current_user.id, title, description, group_id)
        flash('New chore has been added.', 'success')
        return redirect(url_for('chores.view_chore', chore_id=new_chore.id))

    form.group.data = request.args.get('group_id', '')

    metadata = Chore.get_chores_metadata(None)
    return render_template('views/chore-add.j2', form=form, metadata=metadata)


@chores.route('/edit/<chore_id>', methods=['GET', 'POST'])
@login_required
def edit_chore(chore_id):
    chore = Chore.get_chore_by_id(chore_id)
    if not chore:
        flash('Requested chore was not found.', 'warning')
        return redirect(url_for('routes.index'))

    if chore.user_id != current_user.id:
        flash('You are not allowed to edit this chore', 'warning')
        return redirect(url_for('chores.view_chore', chore_id=chore_id))

    group_choices = get_group_choices(current_user.id)
    form = EditChoreForm(group_choices=group_choices)

    if form.validate_on_submit():
        update = {
            'title': form.title.data,
            'group_id': form.group.data,
            'description': sanitize_markdown(form.description.data),
            'last_update': datetime.now()
        }

        # TODO: Create a history module and save every update in it
        # TODO: If the group_id has changed, this chore should be at the end of the list

        result = Chore.update_one(chore_id, update)
        if result.modified_count == 0:
            flash('Changes could not be saved. Please try again later.', 'danger')
        else:
            flash('All changes were saved.', 'success')

        return redirect(url_for('chores.view_chore', chore_id=chore_id))

    form.title.data = chore.title
    form.group.data = chore.group_id
    form.description.data = chore.description

    metadata = Chore.get_chores_metadata(chore.id)
    return render_template('views/chore-edit.j2', form=form, metadata=metadata, chore=chore)


@chores.route('/remove/<chore_id>')
@login_required
def remove_chore(chore_id):
    chore = Chore.get_chore_by_id(chore_id)
    if not chore or chore.user_id != current_user.id:
        flash('You are not allowed to delete this chore.', 'warning')
        return redirect(url_for('chores.view_chore', chore_id=chore_id))

    result = Chore.remove_one(chore_id)
    if result.modified_count == 0:
        flash('The chore was not deleted. Please try again later.', 'danger')
    else:
        flash('The chore was successfully deleted.', 'success')

    return redirect(url_for('routes.index'))


@chores.route('/<chore_id>')
@login_required
def view_chore(chore_id):
    chore = Chore.get_chore_by_id(chore_id)
    if not chore:
        flash('Requested chore was not found.', 'warning')
        return redirect(url_for('routes.index'))

    if chore.user_id != current_user.id:
        flash('You are not allowed to view this chore', 'warning')
        return redirect(url_for('routes.index'))

    metadata = Chore.get_chores_metadata(chore.id)
    return render_template('views/chore.j2', metadata=metadata, chore=chore)


# API routes

@chores.route('/update', methods=['POST'])
def update_chores():
    data = request.get_json()

    if data.get('user_id') != current_user.id:
        return jsonify({'error': 'You are not allowed to update the chores'}), 403

    updates = data.get('updates', [])
    updates_count = len(updates)
    if updates_count == 0:
        return jsonify({'error': 'There are no chores to be updated'}), 403

    updated_count = 0
    for update in updates:
        chore_id = update.pop('chore_id')
        result = Chore.update_one(chore_id, update)
        updated_count += result.modified_count

    if updated_count == updates_count:
        return jsonify({'success': f'All {updates_count} chores successfully updated'}), 200

    return jsonify({'success': f'Successfully updated {updated_count} of {updates_count} chores'}), 200
