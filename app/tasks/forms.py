from flask_wtf import FlaskForm
from wtforms import SelectField, StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired


# TODO: It would be nice to integrate both forms into one


class AddTaskForm(FlaskForm):
    def __init__(self, *args, group_choices=None, **kwargs):
        super(AddTaskForm, self).__init__(*args, **kwargs)

        if group_choices:
            self.group.choices = group_choices

    title = StringField('Title', validators=[DataRequired()])
    group = SelectField('Group', choices=[])
    description = TextAreaField('Description', render_kw={'rows': 10, 'style': 'min-height:200px;'},
                                validators=[DataRequired()])
    submit = SubmitField('Add task')


class EditTaskForm(FlaskForm):
    def __init__(self, *args, group_choices=None, **kwargs):
        super(EditTaskForm, self).__init__(*args, **kwargs)

        if group_choices:
            self.group.choices = group_choices

    title = StringField('Title', validators=[DataRequired()])
    group = SelectField('Group', choices=[])
    description = TextAreaField('Description', render_kw={'rows': 10, 'style': 'min-height:200px;'},
                                validators=[DataRequired()])
    submit = SubmitField('Save changes')
