import Toaster from "./toaster";
import Fetcher from "./fetcher";

export function groupTitleEditToggle(event: MouseEvent) {
    event.preventDefault();

    const editLinkParent = (event.target as HTMLElement).closest<HTMLElement>('[data-group-id]');
    const choreGroupTitle = editLinkParent?.querySelector('.chore-group-title');
    const choreGroupForm = editLinkParent?.querySelector('.chore-group-form');
    const choreGroupFormInput = choreGroupForm?.querySelector('input');
    const groupId = editLinkParent?.dataset.groupId;

    if (!editLinkParent || !choreGroupTitle || !choreGroupForm || !choreGroupFormInput) return;

    choreGroupTitle.classList.remove('d-flex');
    choreGroupTitle.classList.add('d-none');

    choreGroupForm.classList.remove('d-none');
    choreGroupForm.classList.add('d-flex');

    choreGroupFormInput.focus();

    async function handleChoreGroupFormChange(event: Event) {
        event.preventDefault();

        if (!editLinkParent || !choreGroupTitle || !choreGroupForm || !choreGroupFormInput) return;

        const newTitle = choreGroupFormInput.value.trim();

        if (newTitle === '') {
            Toaster.flash('The name of the group couldn\'t be empty.', 'danger');
            setTimeout(() => {
                choreGroupFormInput.focus();
            }, 0);
            return;
        }

        const innerSpan = choreGroupTitle.querySelector('span');
        innerSpan && (innerSpan.innerText = newTitle);
        editLinkParent.dataset.groupTitle = newTitle;

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

        choreGroupForm.removeEventListener('submit', handleChoreGroupFormChange);
        choreGroupFormInput.removeEventListener('change', handleChoreGroupFormChange);
        choreGroupFormInput.removeEventListener('blur', handleChoreGroupFormChange);
    }

    choreGroupForm.addEventListener('submit', handleChoreGroupFormChange);
    choreGroupFormInput.addEventListener('change', handleChoreGroupFormChange);
    choreGroupFormInput.addEventListener('blur', handleChoreGroupFormChange);
}
