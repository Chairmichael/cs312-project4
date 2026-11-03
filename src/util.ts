export type UserSignupData = {
    username: string;
    password: string;
    passwordAgain: string;
    fullname: string;
};

export function validateSignup(data: UserSignupData): string {
    if (data.username.length < 3 || data.username.length > 24)
        return 'Username must be between 3-24';
    return '';
}