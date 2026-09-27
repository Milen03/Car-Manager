const jwt = require('./jwt');
const { authCookieName, authCookieOptions } = require('../app-config');
const {
    userModel,
    tokenBlacklistModel
} = require('../models');

// Errors that mean "this session is not valid" rather than "the server broke".
// jsonwebtoken reports bad, missing and expired tokens through these names.
const unauthenticatedErrors = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'];
const unauthenticatedMessages = ['blacklisted token', 'user not found'];

function auth(redirectUnauthenticated = true) {

    return function (req, res, next) {
        const token = req.cookies[authCookieName] || '';
        Promise.all([
            jwt.verifyToken(token),
            tokenBlacklistModel.findOne({ token })
        ])
            .then(([data, blacklistedToken]) => {
                if (blacklistedToken) {
                    return Promise.reject(new Error('blacklisted token'));
                }
                return userModel.findById(data.id)
                    .then(user => {
                        if (!user) {
                            throw new Error('user not found');
                        }
                        req.user = user;
                        req.isLogged = true;
                        next();
                    });
            })
            .catch(err => {
                if (!redirectUnauthenticated) {
                    next();
                    return;
                }
                if (unauthenticatedErrors.includes(err.name) || unauthenticatedMessages.includes(err.message)) {
                    res.clearCookie(authCookieName, authCookieOptions)
                        .status(401)
                        .send({ message: "Invalid token!" });
                    return;
                }
                next(err);
            });
    }
}

module.exports = auth;
