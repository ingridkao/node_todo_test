const http = require('http')
const url = require('url')
const errorHandler = require('./utils/errorHandler');
const successHandler = require('./utils/successHandler');
const validHandler = require('./utils/validHandler');
const { v4: uuidv4 } = require('uuid');
const port = 8081

// 透過程序中的記憶體存放
const todos = []

const getTodos = (params, response) => {
    try {
        const newTodos = todos.filter(item => {
            let result = true
            if(result && params && params.uid) result = item.id == params.uid
            if(result && params && params.statu) result = item.statu == params.statu
            return result
        })
        successHandler.success(response, newTodos || [])
    } catch (error) {
        errorHandler.errorMsg(response, `例外錯誤：${error}`)
    }
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
    request.on('end', () => {
        // 封包傳送完畢handler
        try {
            // console.log(body);  // 傳送資料
            // console.log(count); // 傳送幾次
            const newdata = JSON.parse(body)
            const titleIsValid = validHandler.isValidTitle(newdata.title);
            if(titleIsValid){
                todos.push({
                    id: uuidv4(),
                    title: String(newdata.title),
                    statu: Number(newdata.statu) || 0
                })
                successHandler.success(response, todos)
            }else{
                errorHandler.errorMsg(response, '錯誤輸入')
            }
        } catch (error) {
            errorHandler.errorMsg(response, `例外錯誤：${error}`)
        }
    })
}

const updateTodos = (request, response) => {
    const requestURL = request.url
    const targetID = requestURL.split('/').pop()
    const targetIndex = todos.findIndex(item => item.id === targetID)
    if (targetIndex < 0) {
        successHandler.nocontent(response)
    }else{
        let body = ''
        // 開始抓TCP封包handler
        request.on('data', (chunk) => {
            body += chunk
        })
        request.on('end', () => {
            // 封包傳送完畢handler
            try {
                const newdata = JSON.parse(body)
                const titleIsValid = validHandler.isValidTitle(newdata.title);
                if(titleIsValid){
                    if(newdata.statu !== undefined ){
                        todos[targetIndex]['statu'] = newdata.statu
                        todos[targetIndex]['title'] = newdata.title
                    }
                    successHandler.success(response, todos[targetIndex])
                }else{
                    errorHandler.errorMsg(response, '錯誤輸入')
                }
            } catch (error) {
                errorHandler.errorMsg(response, `例外錯誤：${error}`)
            }
        })

    }
}

const deleteTodos = (targetID, response) => {
    try {
        const targetIndex = todos.findIndex(item => item.id === targetID)
        if (targetIndex === -1) {
            successHandler.nocontent(response)
        } else {
            todos.splice(targetIndex, 1)
            successHandler.success(response, todos || [])
        }
    } catch (error) {
    }
}

// 當 url 提供錯誤時，會繼續進行 API 的操作，而不是導向 404，這個部分需再調整唷
const requestListner = (request, response) => {
    try {
        const parseURL = url.parse(request.url, true)
        if (request.method === 'OPTIONS' || parseURL.pathname === '/favicon.ico') {
            successHandler.success()
        } else if (parseURL.pathname === '/') {
            errorHandler.noFound(response)
        } else if (parseURL.pathname.includes('/todos')) {
            const splitURL = parseURL.pathname.split('/todos/')
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
                        successHandler.success(todos)
                    }
                    break;
                default:
                    errorHandler.noFound(response)
                    break;
            }
        }else{
            errorHandler.noFound(response)
        }
    } catch (error) {
        errorHandler.errorMsg(response, `例外錯誤：${error}`)
    }
}

const server = http.createServer(requestListner)
server.listen(port)