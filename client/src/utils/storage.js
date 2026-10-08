// localStorage can be missing or throw (private windows, blocked site data,
// sandboxed previews), so every read and write falls back to memory.
const memory = new Map();

export function readItem(key) {
    try {
        const value = window.localStorage.getItem(key);
        if (value !== null) {
            return value;
        }
    } catch {
        // fall through to memory
    }
    return memory.has(key) ? memory.get(key) : null;
}

export function writeItem(key, value) {
    memory.set(key, value);
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // memory copy is enough for this visit
    }
}
