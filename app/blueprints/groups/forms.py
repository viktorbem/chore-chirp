from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired


class AddGroupForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    submit = SubmitField('Add group')
