const authCookieName = 'auth-cookie';
const isProduction = process.env.NODE_ENV === 'production';
const cookieSecret = process.env.COOKIESECRET;

if (isProduction && (!cookieSecret || cookieSecret.length < 32)) {
    throw new Error('COOKIESECRET must be set to at least 32 characters in production');
}

module.exports = {
    authCookieName,
    cookieSecret: cookieSecret || 'SoftUni-development-only',
    isProduction,
}