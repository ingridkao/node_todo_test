const headers = require('./header');
function errorMsg (response, error) {
    console.log(headers);
    // response.writeHead(400, headers);
    // response.write(JSON.stringify({
    //     data: {
    //         status: 'fall',
    //         data: error
    //     },
    // }));
    // response.end();
}

module.exports = errorMsg;