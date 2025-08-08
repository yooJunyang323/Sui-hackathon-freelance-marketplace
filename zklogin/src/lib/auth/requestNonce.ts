export async function createZkLoginNonce(ephemeralPublicKey: string, provider: string) {
    const encodedKey = encodeURIComponent(ephemeralPublicKey);
    const url = 'https://zklogin-api.devnet.sui.io/getNonce?ephemeralPublicKey=${encodedKey}&jwtProvider=${provider}';

    const response = await fetch(url);
    if (!response.ok){
        throw new Error('Failed to fetch nonce: ${response.statusText}');
    }

    
    const data = await response.json();

    return data.nonce;
}