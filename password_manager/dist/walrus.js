// walrus.ts
// Simple password manager logic storing encrypted entries in localStorage
import { encrypt, decrypt } from './seal';
const STORAGE_KEY = 'password_manager_entries';
function loadEntries() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data)
        return [];
    try {
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
export async function addEntry(entry, masterPassword) {
    const entries = loadEntries();
    // Encrypt the password field only
    const encryptedPassword = await encrypt(entry.password, masterPassword);
    const newEntry = { ...entry, password: encryptedPassword };
    entries.push(newEntry);
    saveEntries(entries);
}
export async function getEntries(masterPassword) {
    const entries = loadEntries();
    const decryptedEntries = [];
    for (const entry of entries) {
        try {
            const decryptedPassword = await decrypt(entry.password, masterPassword);
            decryptedEntries.push({ ...entry, password: decryptedPassword });
        }
        catch {
            // wrong password or corrupted data, skip or handle error
            console.warn(`Failed to decrypt entry ${entry.name}`);
        }
    }
    return decryptedEntries;
}
export function removeEntry(id) {
    const entries = loadEntries();
    const filtered = entries.filter(e => e.id !== id);
    saveEntries(filtered);
}
