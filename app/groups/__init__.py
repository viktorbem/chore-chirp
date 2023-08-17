from flask import Blueprint, redirect, url_for, render_template
from flask_login import current_user, login_required

from app.groups.forms import AddGroupForm
from app.groups.models import Group

groups = Blueprint('groups', __name__, template_folder='templates')


@groups.route('/add', methods=['GET', 'POST'])
@login_required
def add_group():
    form = AddGroupForm()
    if form.validate_on_submit():
        title = form.title.data

        new_group = Group.create_group(current_user, title)
        return redirect(url_for('routes.index'))

    return render_template('add-group.html', form=form)
