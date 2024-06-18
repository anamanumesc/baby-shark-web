const parseMultipartFormData = (req, callback) => {
    const contentType = req.headers['content-type'];
    console.log('Content-Type:', contentType);

    if (!contentType) {
        callback(new Error('Missing Content-Type header'), null);
        return;
    }

    const boundaryIndex = contentType.indexOf('boundary=');
    if (boundaryIndex === -1) {
        callback(new Error('Invalid Content-Type header'), null);
        return;
    }

    const boundary = '--' + contentType.substring(boundaryIndex + 9);
    console.log('Boundary:', boundary);
    let body = '';

    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        console.log('Body:', body);
        const parts = body.split(boundary);
        const fields = {};
        const files = {};

        parts.forEach(part => {
            if (part.includes('Content-Disposition: form-data')) {
                const [header, content] = part.split('\r\n\r\n');
                const nameMatch = header.match(/name="([^"]+)"/);
                if (nameMatch) {
                    const name = nameMatch[1];
                    if (header.includes('filename=')) {
                        const filenameMatch = header.match(/filename="([^"]+)"/);
                        if (filenameMatch) {
                            const filename = filenameMatch[1];
                            const fileContent = content.trim().split('\r\n')[0];
                            files[name] = { filename, content: Buffer.from(fileContent, 'binary') };
                            console.log('File:', files[name].filename);
                        }
                    } else {
                        fields[name] = content.trim().split('\r\n')[0];
                        console.log('Field:', fields[name]);
                    }
                }
            }
        });

        callback(null, fields, files);
    });
};

module.exports = parseMultipartFormData;
