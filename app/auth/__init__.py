from flask import Blueprint, flash, redirect, render_template, url_for
from flask_login import login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from app.auth.forms import LoginForm, RegisterForm
from app.auth.models import User

auth = Blueprint('auth', __name__, template_folder='templates')


@auth.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = User.get_user_by_email(email)
        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Successfully logged in.', 'success')
            return redirect(url_for('routes.index'))
        else:
            flash('Unable to log in. Please try again.', 'danger')

    return render_template('login.html', form=form)


@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        stored_user = User.get_user_by_email(email)
        if stored_user:
            flash('Email already exists. Please log in instead.', 'danger')
        else:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
            new_user = User.create_user(email, hashed_password)
            login_user(new_user)
            flash('Successfully logged in.', 'success')
            return redirect(url_for('routes.index'))

    return render_template('register.html', form=form)


@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
