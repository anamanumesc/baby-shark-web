const handleError = (res, err) => {
    res.writeHead(err.statusCode || 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: err.status || 'error',
        message: err.message
    }));
}

module.exports = handleError;
