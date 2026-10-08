// Asks the user to confirm a destructive action. The demo build runs inside a
// frame that silently answers window.confirm() with false, so it shows its own
// dialog instead.
import { demoConfirm } from '../demo/dialogs.js'

export default function confirmAction(message) {
    if (import.meta.env.VITE_DEMO === 'true') {
        return demoConfirm(message)
    }
    return Promise.resolve(window.confirm(message))
}
