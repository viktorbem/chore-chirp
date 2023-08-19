// TODO: This file desperately needs some refactoring

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

async function handleTaskChanges(element) {
    const group = element.closest('.card-task-group');
    const groupId = group.dataset.groupId;

    const updates = [];
    const taskElements = group.querySelectorAll('.card-task');

    for (let i = 0; i < taskElements.length; i++) {
        const taskId = taskElements[i].dataset.taskId;
        updates.push({
            task_id: taskId,
            group_id: groupId,
            position: i,
        });
    }

    try {
        await fetch(App.endpoints.updateTasks, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: App.userId,
                updates: updates,
            }),
        });
    } catch (err) {
        console.error('Unable to update tasks:', err);
    }
}

async function handleGroupChanges(element) {
    const container = document.querySelector('.task-group-container');
    if (!container) return;

    const updates = [];
    const groupElements = container.querySelectorAll('.card-task-group');

    for (let i = 0; i < groupElements.length; i++) {
        const groupId = groupElements[i].dataset.groupId;
        updates.push({
            group_id: groupId,
            position: i,
        });
    }

    try {
        await fetch(App.endpoints.updateGroups, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: App.userId,
                updates: updates,
            }),
        });
    } catch (err) {
        console.error('Unable to update groups:', err);
    }
}

new Dragger('.card-task-container', '.card-task[draggable="true"]', handleTaskChanges);
new Dragger('.row', '.col[draggable="true"]', handleGroupChanges, true);


/**
 * Edit group name related features
 */

document.querySelectorAll('.link-edit-group-name').forEach((editLink) => {
    editLink.addEventListener('click', (event) => {
        event.preventDefault();
        const editLinkParent = editLink.closest('[data-group-id]');
        const groupId = editLinkParent.dataset.groupId;

        const taskGroupTitle = editLinkParent.querySelector('.task-group-title');
        taskGroupTitle.classList.remove('d-flex');
        taskGroupTitle.classList.add('d-none');

        const taskGroupForm = editLinkParent.querySelector('.task-group-form');
        taskGroupForm.classList.remove('d-none');
        taskGroupForm.classList.add('d-flex');

        const taskGroupFormInput = taskGroupForm.querySelector('input');
        taskGroupFormInput.focus();

        async function handleTaskGroupFormChange(event) {
            event.preventDefault();

            const newTitle = taskGroupFormInput.value;
            taskGroupTitle.querySelector('span').innerText = newTitle;

            try {
                await fetch(App.endpoints.updateGroups, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: App.userId,
                        updates: [{
                            group_id: groupId,
                            title: newTitle,
                        }],
                    }),
                });
            } catch (err) {
                console.error('Unable to update group title:', err);
            }

            taskGroupTitle.classList.remove('d-none');
            taskGroupTitle.classList.add('d-flex');

            taskGroupForm.classList.remove('d-flex');
            taskGroupForm.classList.add('d-none');

            taskGroupFormInput.removeEventListener('change', handleTaskGroupFormChange);
            taskGroupFormInput.removeEventListener('blur', handleTaskGroupFormChange);
        }

        taskGroupFormInput.addEventListener('change', handleTaskGroupFormChange);
        taskGroupFormInput.addEventListener('blur', handleTaskGroupFormChange);
   });
});
