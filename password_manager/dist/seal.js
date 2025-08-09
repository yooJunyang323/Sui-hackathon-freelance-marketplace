// seal.ts
// Encryption utilities using Web Crypto API, AES-GCM 256-bit
const encoder = new TextEncoder();
const decoder = new TextDecoder();
async function getKeyMaterial(password) {
    return crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']);
}
async function deriveKey(password, salt) {
    const keyMaterial = await getKeyMaterial(password);
    return crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
    }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encrypt(text, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
    // Combine salt + iv + encrypted data
    const encryptedBytes = new Uint8Array(encrypted);
    const combined = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedBytes, salt.length + iv.length);
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
}
export async function decrypt(dataB64, password) {
    const combined = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return decoder.decode(decrypted);
}
