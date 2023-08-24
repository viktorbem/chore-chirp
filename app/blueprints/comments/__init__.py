from flask import Blueprint, jsonify, request
from flask_login import current_user

from app.blueprints.comments.models import Comment
from app.helpers import sanitize_markdown

comments = Blueprint('comments', __name__, template_folder='templates')


# API routes

@comments.route('/')
def get_comments():
    task_id = request.args.get('task_id')
    if not task_id:
        return jsonify({'error': 'Unable to fetch comments due to missing task ID.'}), 403

    stored_comments = Comment.get_comments_by_task(task_id)
    if len(stored_comments) == 0:
        return jsonify({'error': 'No comments for this task.'}), 404

    return jsonify({'success': 'true', 'comments': [comment.get_dict() for comment in stored_comments]}), 200


@comments.route('/add', methods=['POST'])
def add_comment():
    data = request.get_json()

    user_id = data.get('user_id')
    if user_id != current_user.id:
        return jsonify({'error': 'You are not allowed to post a comment.'}), 403

    task_id = data.get('task_id')
    sanitized_body = sanitize_markdown(data.get('comment_body'))

    # TODO: Adding a comment should be also stored in a history module

    new_comment = Comment.create_comment(user_id, task_id, sanitized_body)
    if not new_comment:
        return jsonify({'error': 'Unable to save the comment. Please try again.'}), 403

    return jsonify({'success': 'true', 'comment': new_comment.get_dict()}), 200


@comments.route('/edit', methods=['POST'])
def edit_comment():
    data = request.get_json()

    user_id = data.get('user_id')
    comment_id = data.get('comment_id')

    edited_comment = Comment.get_comment_by_id(comment_id)

    if not edited_comment:
        return jsonify({'error': 'Unable to edit the comment'}), 403

    if user_id != edited_comment.user_id:
        return jsonify({'error': 'You are not allowed to edit this comment'}), 403

    updated_body = data.get('comment_body')
    if not updated_body:
        return jsonify({'error': 'Empty comments cannot be saved'}), 403

    result = edited_comment.save_changes({'body': sanitize_markdown(updated_body)})
    if result.modified_count == 0:
        return jsonify({'error', 'Changes could not be saved'}), 403

    return jsonify({'success': 'All changes were saved', 'comment': edited_comment.get_dict()}), 200


@comments.route('/update', methods=['POST'])
def update_comments():
    data = request.get_json()

    user_id = data.get('user_id')
    if user_id != current_user.id:
        return jsonify({'error': 'You are not allowed to update a comment'}), 403

    updates = data.get('updates', [])
    updates_count = len(updates)
    if updates_count == 0:
        return jsonify({'error', 'There are no comments to be updated'}), 403

    updated_count = 0
    for update in updates:
        comment_id = update.pop('comment_id')
        result = Comment.update_one(comment_id, update)
        updated_count += result.modified_count

    if updated_count == updates_count:
        return jsonify({'success': f'All {updates_count} comments successfully updated'}), 200

    return jsonify({'succes': f'Successfully updated {updated_count} of {updates_count} comments'}), 200
