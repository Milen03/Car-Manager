const {
    userModel,
    tokenBlacklistModel
} = require('../models');

const utils = require('../utils');
const { authCookieName, authCookieOptions, authCookieMaxAge } = require('../app-config');

const bsonToJson = (data) => { return JSON.parse(JSON.stringify(data)) };
const removePassword = (data) => {
    const { password, __v, ...userData } = data;
    return userData
}

const setAuthCookie = (res, token) => {
    res.cookie(authCookieName, token, { ...authCookieOptions, maxAge: authCookieMaxAge });
};

function register(req, res, next) {
    const { email, username, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
    }

    return userModel.create({ email, username, password })
        .then((createdUser) => {
            createdUser = bsonToJson(createdUser);
            createdUser = removePassword(createdUser);

            const token = utils.jwt.createToken({ id: createdUser._id });
            setAuthCookie(res, token);
            res.status(200)
                .send(createdUser);
        })
        .catch(err => {
            if (err.code === 11000) {
                const field = Object.keys(err.keyPattern || {})[0] || 'email or username';
                res.status(409)
                    .send({ message: `This ${field} is already registered!` });
                return;
            }
            if (err.name === 'ValidationError') {
                res.status(400).send({ message: err.message });
                return;
            }
            next(err);
        });
}

function login(req, res, next) {
    const { email, password } = req.body;

    userModel.findOne({ email })
        .then(user => {
            return Promise.all([user, user ? user.matchPassword(password) : false]);
        })
        .then(([user, match]) => {
            if (!match) {
                res.status(401)
                    .send({ message: 'Wrong email or password' });
                return
            }
            user = bsonToJson(user);
            user = removePassword(user);

            const token = utils.jwt.createToken({ id: user._id });
            setAuthCookie(res, token);
            res.status(200)
                .send(user);
        })
        .catch(next);
}

function logout(req, res, next) {
    const token = req.cookies[authCookieName];

    res.clearCookie(authCookieName, authCookieOptions);

    if (!token) {
        res.status(200).send({ message: 'Logged out!' });
        return;
    }

    tokenBlacklistModel.create({ token })
        .then(() => {
            res.status(200)
                .send({ message: 'Logged out!' });
        })
        .catch(next);
}

function getProfileInfo(req, res, next) {
    const { _id: userId } = req.user;

    userModel.findOne({ _id: userId }, { password: 0, __v: 0 }) //finding by Id and returning without password and __v
        .then(user => { res.status(200).json(user) })
        .catch(next);
}

function editProfileInfo(req, res, next) {
    const { _id: userId } = req.user;
    const { username, email } = req.body;

    userModel.findOneAndUpdate({ _id: userId }, { username, email }, { runValidators: true, new: true })
        .then(x => { res.status(200).json(x) })
        .catch(next);
}

module.exports = {
    login,
    register,
    logout,
    getProfileInfo,
    editProfileInfo,
}
