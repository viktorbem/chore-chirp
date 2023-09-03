import Fetcher from "../utilities/fetcher";

interface IUpdate {
    chore_id?: string,
    group_id: string,
    position: number,
}

type THandler = null | ((element: HTMLElement) => Promise<void>);


export default class DragNDrop {
    private readonly containerSelector: string;
    private readonly childSelector: string;
    private readonly handler: THandler;
    private readonly horizontal: boolean;

    private draggedElement: HTMLElement | null
    private draggables: NodeListOf<HTMLElement>
    private containers: NodeListOf<HTMLElement>

    constructor(containerSelector: string, childSelector: string, handler: THandler = null, horizontal: boolean = false) {
        this.containerSelector = containerSelector;
        this.childSelector = childSelector;

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
                    this.draggedElement && this.handler(this.draggedElement);
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

    getDragAfterElement(container: HTMLElement, x: number, y: number) {
        const lastChild = container.querySelector(':scope > *:not([draggable="true"])');
        const childElements = [...container.querySelectorAll(`${this.childSelector}:not(.dragging)`)];
        const afterElement = childElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = this.horizontal ? this.getXOffset(box, x) : this.getYOffset(box, y);
            if (offset < 0 && offset > closest.offset) {
                return { element: child, offset: offset };
            }
            return closest;
        }, { element: lastChild, offset: Number.NEGATIVE_INFINITY });
        return afterElement.element;
    }

    getXOffset(box: DOMRect, x: number): number {
        return x - box.left - (box.width / 2);
    }

    getYOffset(box: DOMRect, y: number): number {
        return y - box.top - (box.height / 2);
    }
}

export async function handleChoreChanges(element: HTMLElement) {
    const group = element.closest<HTMLElement>('.card-chore-group');
    if (!group) return;

    const groupId = group.dataset.groupId;

    const updates: IUpdate[] = [];
    const choreElements = group.querySelectorAll<HTMLElement>('.card-chore');

    for (let i = 0; i < choreElements.length; i++) {
        const choreId = choreElements[i].dataset.choreId;
        updates.push({
            chore_id: choreId ?? '',
            group_id: groupId ?? '',
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

    document.dispatchEvent(new Event('chores:updated'));
}

export async function handleGroupChanges() {
    const container = document.querySelector('.chore-group-container');
    if (!container) return;

    const updates: IUpdate[] = [];
    const groupElements = container.querySelectorAll<HTMLElement>('.card-chore-group');

    for (let i = 0; i < groupElements.length; i++) {
        const groupId = groupElements[i].dataset.groupId;
        updates.push({
            group_id: groupId ?? '',
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