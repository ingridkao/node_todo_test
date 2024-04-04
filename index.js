const http = require('http')
const url = require('url')

const headers = require('./utils/header');
const errorHandler = require('./utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const port = 8081

// 透過程序中的記憶體存放
const todos = []

const getTodos = (params, response) => {
    const newTodos = todos.filter(item => {
        let result = true
        if(result && params && params.uid) result = item.id == params.uid
        if(result && params && params.statu) result = item.statu == params.statu
        return result
    })
    response.writeHead(200, headers);
    response.write(JSON.stringify({
        data: {
            status: 'success',
            data: newTodos || []
        }
    }));
    response.end();
}

const addTodos = (request, response) => {
    let body = ''
    // let count = 0
    // 開始抓TCP封包handler
    request.on('data', (chunk) => {
        // console.log(chunk); // this is buffer
        body += chunk
        // count += 1
    })
    // 封包傳送完畢handler
    request.on('end', () => {
        // console.log(body);  // 傳送資料
        // console.log(count); // 傳送幾次
        try {
            const newdata = JSON.parse(body)
            todos.push({
                id: uuidv4(),
                title: String(newdata.title) || '',
                statu: Number(newdata.statu) || 0
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
                todos[targetIndex]['title'] = newdata.title || todos[targetIndex]['title']
                todos[targetIndex]['statu'] = newdata.statu || todos[targetIndex]['statu']

                response.writeHead(200, headers);
                response.write(JSON.stringify({
                    data: {
                        status: 'success',
                        data: todos[targetIndex]
                    },
                }));
                response.end();
            } catch (error) {
                errorHandler(response, error)
            }
        })
    }
}

const deleteTodos = (targetID, response) => {
    const targetIndex = todos.findIndex(item => item.id === targetID)
    if (targetIndex < 0) {
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
                data: todos || []
            }
        }));
        response.end();
    }
}

const requestListner = (request, response) => {
    const parseURL = url.parse(request.url, true)
    const splitURL = parseURL.pathname.split('/todos/')

    if(request.method === 'OPTIONS'){
        response.writeHead(200, headers);
        response.end();
    }else if(splitURL.length > 0){
        switch (request.method) {
            case 'GET':
                const params = parseURL.query
                getTodos(params, response)
                break;
            case 'POST':
                addTodos(request, response)
                break;
            case 'PUT':
                updateTodos(request, response)
                break;
            case 'DELETE':
                if (splitURL.length > 1 && splitURL[1] !== "") {
                    deleteTodos(splitURL[1], response)
                } else {
                    todos.length = 0
                    response.writeHead(200, headers);
                    response.write(JSON.stringify({
                        data: {
                            status: 'success',
                            data: todos
                        },
                    }));
                    response.end();
                }
                break;
            default:
                errorHandler.noFound(response)
                break;
        }
    }else{
        errorHandler.noFound(response)
    }
}

const server = http.createServer(requestListner)
server.listen(port)