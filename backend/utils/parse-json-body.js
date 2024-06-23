const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', () => {
          if (!body) {
              req.body = {}; // Handle empty body
              resolve();
          } else {
              try {
                  req.body = JSON.parse(body);
                  resolve();
              } catch (err) {
                  reject(new SyntaxError('Invalid JSON')); // Provide more specific error message
              }
          }
      });
  });
};

module.exports = parseJsonBody;
