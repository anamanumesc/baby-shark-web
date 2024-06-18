// controllers/view-controller.js

const handleViewRequest = (req, res) => {
    // Implement the logic to handle view requests
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>View Request Handled</h1>');
};

module.exports = { handleViewRequest };
