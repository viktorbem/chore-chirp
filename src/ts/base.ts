import DragNDrop, { handleChoreChanges, handleGroupChanges } from "./features/drag-n-drop";
import ThemeToggle from "./features/theme-toggle";

import {groupTitleEditToggle} from "./utilities/group-title-edit-toggle";
import Toaster from "./utilities/toaster";

// Handle the flash messages from flask backend
App.flashMessages.forEach((messageData) => {
    Toaster.flash(...messageData);
});

// Handle the dark mode toggler
const themeToggle = new ThemeToggle('dark-mode-toggle');
const registerThemeInput = document.querySelector<HTMLInputElement>('input#theme[type="hidden"]');
registerThemeInput && (registerThemeInput.value = themeToggle.currentTheme);

// Initialize drag and drop features
new DragNDrop('.card-chore-container', '.card-chore[draggable="true"]', handleChoreChanges);
new DragNDrop('.row', '.col[draggable="true"]', handleGroupChanges, true);

// Recalculate the number of chores in all groups after dragging
document.addEventListener('chores:updated', () => {
    document.querySelectorAll<HTMLElement>('.card-chore-group').forEach((group) => {
        const chores = group.querySelectorAll('.card-chore[draggable="true"]');
        group.dataset.choresCount = chores.length.toString();
    });
});

// Initialize edit group title features
document.querySelectorAll<HTMLElement>('.link-edit-group-name').forEach((editLink) => {
    editLink.addEventListener('click', groupTitleEditToggle);
});

// Handle the new group addition
document.querySelectorAll<HTMLElement>('[data-group-title=""]').forEach((group) => {
    const editLink = group.querySelector<HTMLElement>('.link-edit-group-name');
    editLink && (editLink.click());
});

// Initialize SimpleMDE markdown editor for every textarea
document.querySelectorAll('textarea:not(.vue)').forEach((element) => {
    new SimpleMDE({ element: element, forceSync: true, status: false });
});
