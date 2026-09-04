const jwt = require('jsonwebtoken');
const isProduction = process.env.NODE_ENV === 'production';
const secret = process.env.SECRET;

if (isProduction && (!secret || secret.length < 32)) {
    throw new Error('SECRET must be set to at least 32 characters in production');
}

const signingOptions = { expiresIn: '1d', algorithm: 'HS256' };

function createToken(data) {
    return jwt.sign(data, secret || 'SoftSecret-development-only', signingOptions);
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret || 'SoftSecret-development-only', { algorithms: ['HS256'] }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

module.exports = {
    createToken,
    verifyToken
}