// In-page replacements for alert() and confirm(), which the frame the demo is
// published in never shows (confirm() returns false straight away).

function overlay() {
    const element = document.createElement('div');
    element.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4';
    return element;
}

export function demoConfirm(message) {
    return new Promise((resolve) => {
        const backdrop = overlay();
        backdrop.innerHTML = `
            <div role="alertdialog" aria-modal="true" aria-labelledby="demo-confirm-text"
                 class="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-xl shadow-black/50">
                <p id="demo-confirm-text" class="text-gray-100 text-sm leading-relaxed"></p>
                <div class="mt-6 flex justify-end gap-3">
                    <button type="button" data-answer="no"
                        class="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm cursor-pointer hover:bg-gray-700">Отказ</button>
                    <button type="button" data-answer="yes"
                        class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium cursor-pointer hover:bg-red-500">Изтрий</button>
                </div>
            </div>`;
        backdrop.querySelector('#demo-confirm-text').textContent = message;

        const close = (answer) => {
            document.removeEventListener('keydown', onKey);
            backdrop.remove();
            resolve(answer);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') close(false);
        };

        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) close(false);
            const answer = event.target.closest('[data-answer]')?.dataset.answer;
            if (answer) close(answer === 'yes');
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(backdrop);
        backdrop.querySelector('[data-answer="no"]').focus();
    });
}

let toastStack = null;

export function demoAlert(message) {
    if (!toastStack) {
        toastStack = document.createElement('div');
        toastStack.setAttribute('role', 'status');
        toastStack.className = 'fixed top-24 left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none';
        document.body.appendChild(toastStack);
    }
    const toast = document.createElement('div');
    toast.className = 'max-w-md w-full rounded-xl border border-yellow-500/40 bg-gray-900 px-4 py-3 text-sm text-gray-100 shadow-lg shadow-black/50';
    toast.textContent = String(message);
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}
