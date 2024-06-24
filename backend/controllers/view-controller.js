const handleViewRequest = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>View Request Handled</h1>');
};

module.exports = { handleViewRequest };
