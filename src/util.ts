export type UserSignupData = {
    username: string;
    password: string;
    passwordAgain: string;
    fullname: string;
};

export async function saltPassword(password: string): Promise<{ salt: string; hash: string }> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    );
    const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
        passwordKey,
        256,
    );

    const toHex = (bytes: Uint8Array) =>
        Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    return { salt: toHex(salt), hash: toHex(new Uint8Array(derivedBits)) };
}

export function validateSignup(data: UserSignupData): string {
    if (data.username.length < 3 || data.username.length > 24)
        return 'Username must be between 3-24';
    if (data.password.length < 10)
        return 'Password must be at least 10 characters long';
    if (data.password !== data.passwordAgain)
        return 'Passwords must match';
    if (data.fullname.length < 1)
        return 'Name cannot be blank'
    return '';
}

