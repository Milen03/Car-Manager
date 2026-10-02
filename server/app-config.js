const authCookieName = '__session';
const { isProduction } = require('./config/env');
// The app sets no signed cookies, so a separate secret adds nothing; fall back to
// the JWT secret so production needs one secret instead of two.
const cookieSecret = process.env.COOKIESECRET || process.env.SECRET;

if (isProduction && (!cookieSecret || cookieSecret.length < 32)) {
    throw new Error('SECRET (or COOKIESECRET) must be set to at least 32 characters in production');
}

// The browser only talks to the Vercel domain, which proxies /api to Railway, so
// the cookie is first-party: Lax works in every browser, including Safari, and blocks
// cross-site request forgery.
const authCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
};

// Matches the JWT lifetime in utils/jwt.js. Kept out of authCookieOptions because
// res.clearCookie would otherwise honour it and never clear the cookie.
const authCookieMaxAge = 24 * 60 * 60 * 1000;

module.exports = {
    authCookieName,
    authCookieOptions,
    authCookieMaxAge,
    cookieSecret: cookieSecret || 'SoftUni-development-only',
    isProduction,
}
