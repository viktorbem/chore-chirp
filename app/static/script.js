// TODO: This file desperately needs some refactoring


/**
 * An object to handle all fetch requests
 */

const Fetcher = (() => {
    const get = async (url, params) => {
        const urlParams = new URLSearchParams(params);
        return fetch(url + '?' + urlParams.toString());
    };
    const post = async (url, payload) => {
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        });
    };

    return {get, post};
})();


/**
 * Dark Mode Toggler
 */

(() => {
    const darkModeToggler = document.getElementById('dark-mode-toggle');
    const registerThemeInput = document.querySelector('input#theme[type="hidden"]');

    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-bs-theme');
    }

    function updateThemeValues(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (!registerThemeInput) return;
        registerThemeInput.value = theme;
    }

    if (getCurrentTheme() === '') {
        const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        updateThemeValues(preferredTheme);
    }

    darkModeToggler?.addEventListener('click', (event) => {
        event.preventDefault();

        // Get the currently set theme
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Set the html element attribute to the new theme
        updateThemeValues(newTheme);
        if (App.userId === '') return;

        // Store the new theme in database if the user is logged in
        try {
            Fetcher.post(App.endpoints.updateUser, {
                user_id: App.userId,
                updates: {
                    theme: newTheme,
                },
            });
        } catch (err) {
            console.error('Unable to set the user\'s theme.', err);
        }
    });
})();


/**
 * Drag and drop related features
 */

class Dragger {
    constructor(containerSelector, childSelector, handler=null, horizontal=false) {
        this.containerSelector = containerSelector;
        this.childSelector = childSelector;
        this.lastChild = document.querySelector(`${this.containerSelector} > *:not([draggable="true"])`);

        this.handler = handler;
        this.horizontal = horizontal;

        this.draggedElement = null;
        this.draggables = document.querySelectorAll(this.childSelector);
        this.containers = document.querySelectorAll(this.containerSelector);

        this.draggables.forEach((draggable) => {
            draggable.addEventListener('dragstart', (event) => {
                event.stopImmediatePropagation();
                draggable.classList.add('dragging');
                this.draggedElement = draggable;
            });

            draggable.addEventListener('dragend', () => {
                if (typeof this.handler === 'function') {
                    this.handler(this.draggedElement);
                }
                draggable.classList.remove('dragging');
                this.draggedElement = null;
            });
        });

        this.containers.forEach((container) => {
            container.addEventListener('dragover', (event) => {
                event.preventDefault();
                if (!this.draggedElement) return;

                const afterElement = this.getDragAfterElement(container, event.clientX, event.clientY);
                if (afterElement) {
                    container.insertBefore(this.draggedElement, afterElement);
                } else {
                    container.appendChild(this.draggedElement);
                }
            });
        });
    }

    getDragAfterElement(container, x, y) {
        const childElements = [...container.querySelectorAll(`${this.childSelector}:not(.dragging)`)];
        const afterElement = childElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = this.horizontal ? this.getXOffset(box, x) : this.getYOffset(box, y);
            if (offset < 0 && offset > closest.offset) {
                return { element: child, offset: offset };
            }
            return closest;
        }, { element: this.lastChild, offset: Number.NEGATIVE_INFINITY });
        return afterElement.element;
    }

    getXOffset(box, x) {
        return x - box.left - (box.width / 2);
    }

    getYOffset(box, y) {
        return y - box.top - (box.height / 2);
    }
}

async function handleChoreChanges(element) {
    const group = element.closest('.card-chore-group');
    const groupId = group.dataset.groupId;

    const updates = [];
    const choreElements = group.querySelectorAll('.card-chore');

    for (let i = 0; i < choreElements.length; i++) {
        const choreId = choreElements[i].dataset.choreId;
        updates.push({
            chore_id: choreId,
            group_id: groupId,
            position: i,
        });
    }

    try {
        await Fetcher.post(App.endpoints.updateChores, {
            user_id: App.userId,
            updates: updates,
        });
    } catch (err) {
        console.error('Unable to update chores:', err);
    }
}

async function handleGroupChanges(element) {
    const container = document.querySelector('.chore-group-container');
    if (!container) return;

    const updates = [];
    const groupElements = container.querySelectorAll('.card-chore-group');

    for (let i = 0; i < groupElements.length; i++) {
        const groupId = groupElements[i].dataset.groupId;
        updates.push({
            group_id: groupId,
            position: i,
        });
    }

    try {
        await Fetcher.post(App.endpoints.updateGroups, {
            user_id: App.userId,
            updates: updates,
        });
    } catch (err) {
        console.error('Unable to update groups:', err);
    }
}

new Dragger('.card-chore-container', '.card-chore[draggable="true"]', handleChoreChanges);
new Dragger('.row', '.col[draggable="true"]', handleGroupChanges, true);


/**
 * Edit group name related features
 */

document.querySelectorAll('.link-edit-group-name').forEach((editLink) => {
    editLink.addEventListener('click', (event) => {
        event.preventDefault();
        const editLinkParent = editLink.closest('[data-group-id]');
        const groupId = editLinkParent.dataset.groupId;

        const choreGroupTitle = editLinkParent.querySelector('.chore-group-title');
        choreGroupTitle.classList.remove('d-flex');
        choreGroupTitle.classList.add('d-none');

        const choreGroupForm = editLinkParent.querySelector('.chore-group-form');
        choreGroupForm.classList.remove('d-none');
        choreGroupForm.classList.add('d-flex');

        const choreGroupFormInput = choreGroupForm.querySelector('input');
        choreGroupFormInput.focus();

        async function handleChoreGroupFormChange(event) {
            event.preventDefault();

            const newTitle = choreGroupFormInput.value;
            choreGroupTitle.querySelector('span').innerText = newTitle;

            try {
                await Fetcher.post(App.endpoints.updateGroups, {
                    user_id: App.userId,
                    updates: [{
                        group_id: groupId,
                        title: newTitle,
                    }],
                });
            } catch (err) {
                console.error('Unable to update group title:', err);
            }

            choreGroupTitle.classList.remove('d-none');
            choreGroupTitle.classList.add('d-flex');

            choreGroupForm.classList.remove('d-flex');
            choreGroupForm.classList.add('d-none');

            choreGroupFormInput.removeEventListener('change', handleChoreGroupFormChange);
            choreGroupFormInput.removeEventListener('blur', handleChoreGroupFormChange);
        }

        choreGroupFormInput.addEventListener('change', handleChoreGroupFormChange);
        choreGroupFormInput.addEventListener('blur', handleChoreGroupFormChange);
   });
});


/**
 * Markdown editor related features
 */

document.querySelectorAll('textarea:not(.vue)').forEach((element) => {
    new SimpleMDE({ element: element, forceSync: true, status: false });
})


/**
 * Comments section
 */

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