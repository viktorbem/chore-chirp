from datetime import datetime

from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from app.blueprints.user.forms import LoginForm, SignupForm
from app.blueprints.user.models import User

user = Blueprint('user', __name__, template_folder='templates')


# Frontend routes

@user.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        stored_user = User.get_user_by_email(email)
        if stored_user and check_password_hash(stored_user.password, password):
            stored_user.login()
            flash('Successfully logged in.', 'success')
            return redirect(url_for('routes.home'))
        else:
            flash('Unable to log in. Please try again.', 'danger')

    if len(form.errors) > 0:
        flash('Some of the form fields are not properly filled.', 'danger')

    return render_template('views/user-login.j2', form=form)


@user.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        theme = form.theme.data

        stored_user = User.get_user_by_email(email)
        if stored_user:
            flash('Email already exists. Please log in instead.', 'danger')
        else:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
            new_user = User.create_user(email, hashed_password, theme)
            new_user.login()
            flash('Your account has been created.', 'success')
            return redirect(url_for('routes.home'))

    if len(form.errors) > 0:
        flash('Some of the form fields are not properly filled.', 'danger')

    return render_template('views/user-signup.j2', form=form)


@user.route('/logout')
def logout():
    logout_user()
    flash('Successfully logged out.', 'success')
    return redirect(url_for('user.login'))


# API routes

@user.route('/update', methods=['POST'])
def update_user():
    data = request.get_json()

    user_id = data.get('user_id')
    if user_id != current_user.id:
        return jsonify({'error': 'You are not allowed to update the user'}), 403

    updates = data.get('updates')
    if not updates:
        return jsonify({'error': 'There is nothing to be updated'}), 403

    result = User.update_one(user_id, updates)
    if result.modified_count == 0:
        return jsonify({'error': 'Changes could not be saved'}), 403

    return jsonify({'success': 'All changes were saved'}), 200
