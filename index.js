const http = require('http')
const headers = require('./utils/header');
const errorHandler = require('./utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const port = 8081

// 透過程序中的記憶體存放
const todos = []

const getTodos = (response) => {
    response.writeHead(200, headers);
    response.write(JSON.stringify({
        data: {
            status: 'success',
            data: todos
        },
    }));
    response.end();
}

const addTodos = (request, response) => {
    let body = ''
    let count = 0
    // 開始抓TCP封包handler
    request.on('data', (chunk) => {
        console.log(chunk); // this is buffer
        body += chunk
        // count += 1
    })
    // 封包傳送完畢handler
    request.on('end', () => {
        console.log(body);  // 傳送資料
        console.log(count); // 傳送幾次
        try {
            const newdata = JSON.parse(body)
            // console.log(newdata.title);
            todos.push({
                title: newdata.title,
                id: uuidv4()
            })
            response.writeHead(200, headers);
            response.write(JSON.stringify({
                data: {
                    status: 'success',
                    data: todos
                },
            }));
            response.end();
        } catch (error) {
            errorHandler.errorMsg(response, error)
        }
    })
}

const updateTodos = (request, response) => {
    let body = ''
    const requestURL = request.url
    const targetID = requestURL.split('/').pop()
    const targetIndex = todos.findIndex(item => item.id === targetID)
    if (targetIndex === -1) {
        response.writeHead(204, headers);
        response.write(JSON.stringify({
            data: {
                status: 'fall',
                massage: 'No content'
            },
        }));
    } else {
        // 開始抓TCP封包handler
        request.on('data', (chunk) => {
            body += chunk
        })
        // 封包傳送完畢handler
        request.on('end', () => {
            try {
                const newdata = JSON.parse(body)
                todos[targetIndex]['title'] = newdata.title
                response.writeHead(200, headers);
                response.write(JSON.stringify({
                    data: {
                        status: 'success',
                        data: todos
                    },
                }));
                response.end();
            } catch (error) {
                errorHandler(response, error)
            }
        })
    }
}

const deleteTodos = (request, response) => {
    const requestURL = request.url
    const targetID = requestURL.split('/').pop()
    const targetIndex = todos.findIndex(item => item.id === targetID)
    if (targetIndex === -1) {
        response.writeHead(204, headers);
        response.write(JSON.stringify({
            data: {
                status: 'fall',
                massage: 'No content'
            },
        }));
    } else {
        todos.splice(targetIndex, 1)
        response.writeHead(200, headers);
        response.write(JSON.stringify({
            data: {
                status: 'success',
                data: todos
            },
        }));
    }
}

const requestListner = (request, response) => {
    switch (request.method) {
        case 'OPTIONS':
            response.writeHead(200, headers);
            response.end();
        case 'GET':
            if (request.url === "/") {
                getTodos(response)
            } else {
                // get target id
            }
            break;
        case 'POST':
            addTodos(request, response)
            break;
        case 'PUT':
            updateTodos(request, response)
            break;
        case 'DELETE':
            if (request.url === "/") {
                todos.length = 0
                response.writeHead(200, headers);
                response.write(JSON.stringify({
                    data: {
                        status: 'success',
                        data: todos
                    },
                }));
                response.end();
            } else {
                deleteTodos(request, response)
            }
            break;
        default:
            response.writeHead(404, headers);
            response.write(JSON.stringify({
                data: {
                    status: 'fall',
                    message: 'Not found'
                },
            }));
            response.end();
            break;
    }
}

const server = http.createServer(requestListner)
server.listen(port)