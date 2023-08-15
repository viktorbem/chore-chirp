from flask import Blueprint, render_template
from flask_login import login_required

routes = Blueprint('routes', __name__)


@routes.route('/')
@login_required
def index():
    return render_template('index.html')
