// @ts-nocheck
// TODO: Change this into a separate VueJS app

import Fetcher from "../../utilities/fetcher";

const commentsAppContainer = document.getElementById('comments-app');
if (commentsAppContainer) {
    const commentsApp = Vue.createApp({
        delimiters: ['${', '}'],
        data() {
            return {
                comments: [],
                editedComment: null,
                editors: {},
                forms: {
                    add: {
                        user_id: App.userId,
                        comment_body: '',
                    },
                },
                isInitialized: false,
                choreData: {},
            }
        },
        mounted() {
            // Get the data about the current chore from the element
            const choreRefElement = this.$refs.choreRefElement;
            if (choreRefElement) {
                this.choreData = {...choreRefElement.dataset};
            }

            // Initialize SimpleMDE instance of the add-comment section
            this.editors.add = new SimpleMDE({element: this.$refs.commentBody, status: false});
            this.editors.add.codemirror.on('change', () => {
                this.forms.add.comment_body = this.editors.add.value();
            });

            // Populate the comments from the backend database
            this.getComments();
        },
        methods: {
            getCommentById(commentId) {
                return this.comments.find((comment) => comment.id === commentId);
            },
            async getComments() {
                try {
                    // Read the comments from the API
                    const response = await Fetcher.get(App.endpoints.getComments, {chore_id: this.choreData.id});
                    const data = await response.json();
                    if (data.comments) {
                        data.comments.forEach((comment) => {
                            this.comments.push(comment);
                            this.setCommentEditForm(comment);
                        });
                    }
                    this.isInitialized = true;
                } catch (err) {
                    console.error('Unable to fetch the comments:', err);
                }
            },
            handleEditCommentChange() {
                this.forms[this.editedComment.id].comment_body = this.editors.edit.value();
            },
            isCommentAuthor(commentId) {
                const comment = this.getCommentById(commentId);
                return comment.user_id === App.userId;
            },
            isCommentEdited(commentId) {
                return commentId === this.editedComment?.id;
            },
            isChoreOwner(choreId) {
                return App.userId === this.choreData.ownerId;
            },
            setCommentEditForm(comment) {
                this.forms[comment.id] = {
                    user_id: App.userId,
                    comment_body: comment.raw_body,
                }
            },
            async submitAddComment() {
                if (this.forms.add.comment_body.trim() === '') {
                    // TODO: Show some flash message to the user
                    return;
                }

                try {
                    const response = await Fetcher.post(App.endpoints.addComment, {
                        ...this.forms.add,
                        chore_id: this.choreData.id
                    });

                    const data = await response.json();
                    const newComment = data.comment;
                    if (newComment) {
                        this.comments.push(newComment);
                        this.setCommentEditForm(newComment);
                    }
                    this.editors.add.value('');
                } catch (err) {
                    console.error('Unable to post a comment:', err);
                }
            },
            async submitEditComment() {
                const submittedForm = this.forms[this.editedComment.id];
                if (submittedForm.comment_body.trim() === '') {
                    // TODO: Show some flash message to the user
                    return;
                }

                if (submittedForm.comment_body === this.editedComment.raw_body) {
                    this.editedComment = null;
                    return;
                }

                try {
                    const response = await Fetcher.post(App.endpoints.editComment, {
                        ...submittedForm,
                        comment_id: this.editedComment.id,
                    });

                    const data = await response.json();
                    if (data.comment) {
                        const updatedComment = data.comment;

                        this.comments = this.comments.map((comment) => {
                            if (comment.id === updatedComment.id) {
                                this.setCommentEditForm(updatedComment);
                                return updatedComment;
                            }
                            return comment;
                        });
                    }
                    this.editedComment = null;

                } catch (err) {
                    console.error('Unable to edit a comment:', err);
                }
            },
            toggleCommentEdit(commentId) {
                if (this.editedComment?.id === commentId) {
                    this.editedComment = null;
                    return;
                }

                let editedComment = null;

                // TODO: It would be nice if we scroll to the top of the edited comment

                this.comments.forEach((comment) => {
                    // Reset all edit forms to default values
                    this.setCommentEditForm(comment);
                    if (comment.id === commentId) {
                        editedComment = comment;
                    }
                });
                this.editedComment = editedComment;
            },
            async toggleCommentVisible(commentId) {
                const comment = this.getCommentById(commentId);

                try {
                    await Fetcher.post(App.endpoints.updateComments, {
                        user_id: App.userId,
                        updates: [{
                            comment_id: commentId,
                            hidden: !comment.hidden,
                        }],
                    });
                    comment.hidden = !comment.hidden;
                } catch (err) {
                    console.error('Unable to toggle the comment visibility:', err);
                }
            },
        },
        watch: {
            editedComment(comment) {
                if (this.editors.edit) {
                    // Destroy the previous instance of the editor
                    this.editors.edit.codemirror.off('change', this.handleEditCommentChange);
                    this.editors.edit.toTextArea();
                    this.editors.edit = null;
                }

                if (comment) {
                    // Create a new instance of the editor
                    const textareaElement = this.$refs[comment.id]?.[0];
                    this.editors.edit = new SimpleMDE({element: textareaElement, status: false});
                    this.editors.edit.codemirror.on('change', this.handleEditCommentChange);
                }
            }
        }
    });

    commentsApp.mount(commentsAppContainer);
}