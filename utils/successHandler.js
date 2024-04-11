const headers = require('./header');
function success (response, data=null) {
    response.writeHead(200, headers);
    if(data){
        response.write(JSON.stringify({
            data: {
                status: 'success',
                data: data
            }
        }));
    }
    response.end();
}

function nocontent (response) {
    try {
        response.writeHead(204, headers);
        response.write(JSON.stringify({
            data: {
                status: 'fall',
                data: 'No content'
            }
        }));
        response.end();
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    success,
    nocontent
};