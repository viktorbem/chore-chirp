export default class Toaster {

    static flash(message: string, category: string) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastElement = document.createElement('div');
        toastElement.classList.add('toast', 'align-items-center', `text-bg-${category}`, 'border-0');
        toastElement.setAttribute('role', 'alert');

        toastElement.innerHTML = '<div class="d-flex">' +
                '<div class="toast-body">' + message + '</div>' +
                '<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>' +
            '</div>';

        toastContainer.appendChild(toastElement);
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        }, { once: true });

        const toast = bootstrap.Toast.getOrCreateInstance(toastElement);
        toast.show();
    }
}
