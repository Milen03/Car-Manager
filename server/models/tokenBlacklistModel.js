const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: { type: String, index: true },
}, { timestamps: { createdAt: 'created_at' } });

// A blacklisted token only matters until the JWT itself expires (1 day, see
// utils/jwt.js), so let MongoDB delete the entry after that.
tokenBlacklistSchema.index({ created_at: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
