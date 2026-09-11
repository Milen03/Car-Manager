function errorHandler(err, req, res, next) {
    const databaseErrorNames = [
        'MongoServerError',
        'MongoServerSelectionError',
        'MongoNetworkError',
        'MongoParseError',
    ];

    if (databaseErrorNames.includes(err.name) || ['ECONNREFUSED', 'ENOTFOUND'].includes(err.code)) {
        console.error(err);
        res.status(503)
            .json({ message: 'Database is unavailable' });
        return;
    }

    if (err.status === 333) {
        res.status(333)
            .json({ message: 'ErrorHandler: not allowed!' })
    } else {
        console.error(err.stack)
        res.status(500)
            .json({ message: 'ErrorHandler: Something went wrong!' })
    }
}

module.exports = errorHandler;
