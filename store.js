const http = require('http')
const url = require('url')

const headers = require('./utils/header');
const errorHandler = require('./utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const port = 8081

// 透過程序中的記憶體存放
const activities = [
    {
        id: 1,
        title: '測試LINE登入1',
        statu: 1,
        img: 'https://i.imgur.com/UjJvQuU.png',
        link: '/activity'
    }, {
        id: 2,
        title: '測試LINE登入2',
        statu: 1,
        img: 'https://i.imgur.com/00NrfI2.png',
        link: '/activity'
    },
    {
        id: 3,
        title: '預告活動',
        statu: 2,
        // img: 'https://picsum.photos/seed/picsum/400/300',
        link: '/activity'
    },
    {
        id: 4,
        title: '全台7-11門市',
        statu: 1,
        // img: 'https://picsum.photos/seed/picsum/400/300',
        link: '/mapStore '
    },
    {
        id: 5,
        title: '使徒來襲(已結束)',
        statu: 0,
        // img: 'https://picsum.photos/seed/picsum/400/300',
        link: '/mapEva'
    }
]

const collects = [
    {
        store_id: '870504',
        store_name: '道生',
        checkInTime: '2024/01/12 09:12'
    },
    {
        store_id: '240709',
        store_name: '威京',
        checkInTime: '2024/01/15 19:12'
    }
]

const albums = [
    {
        event_id: '1',
        event_name: '歡樂一夏',
        collection: 2,
        limit: 8
    },
    {
        event_id: '2',
        event_name: '歡樂一夏夏',
        collection: 1,
        limit: 4
    }
]

const getActivities = (params, response) => {
    const list = activities.filter(item => {
        let result = true
        if(result && params && params.uid) result = item.id == params.uid
        if(result && params && params.statu) result = item.statu == params.statu
        return result
    })
    response.writeHead(200, headers);
    response.write(JSON.stringify(list || []));
    response.end();
}

const addActivities = (request, response) => {
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
            activities.push({
                id: uuidv4(),
                title: String(newdata.title) || '',
                statu: Number(newdata.statu) || 0
            })
            response.writeHead(200, headers);
            response.write(JSON.stringify({
                data: {
                    status: 'success',
                    data: activities
                },
            }));
            response.end();
        } catch (error) {
            errorHandler.errorMsg(response, error)
        }
    })
}

const updateActivities = (request, response) => {
    let body = ''
    const requestURL = request.url
    const targetID = requestURL.split('/').pop()
    const targetIndex = activities.findIndex(item => item.id === targetID)
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
                activities[targetIndex]['title'] = newdata.title || activities[targetIndex]['title']
                activities[targetIndex]['statu'] = newdata.statu || activities[targetIndex]['statu']

                response.writeHead(200, headers);
                response.write(JSON.stringify({
                    data: {
                        status: 'success',
                        data: activities[targetIndex]
                    },
                }));
                response.end();
            } catch (error) {
                errorHandler(response, error)
            }
        })
    }
}

const deleteActivities = (targetID, response) => {
    const targetIndex = activities.findIndex(item => item.id === targetID)
    if (targetIndex < 0) {
        response.writeHead(204, headers);
        response.write(JSON.stringify({
            data: {
                status: 'fall',
                massage: 'No content'
            },
        }));
    } else {
        activities.splice(targetIndex, 1)
        response.writeHead(200, headers);
        response.write(JSON.stringify({
            data: {
                status: 'success',
                data: activities || []
            }
        }));
        response.end();
    }
}

const getCollect = (params, response) => {
    const list = collects.filter(item => {
        let result = true
        if(result && params && params.id) result = item.store_id == params.id
        return result
    })
    response.writeHead(200, headers);
    response.write(JSON.stringify(list || []));
    response.end();
}

const getAlbums = (querys, response) => {
    const list = albums.filter(item => {
        let result = true
        if(result && querys && querys.id) result = item.event_id == querys.id
        return result
    })
    response.writeHead(200, headers);
    response.write(JSON.stringify(list || []));
    response.end();
}

const requestListner = (request, response) => {
    const parseURL = url.parse(request.url, true)
    if (request.method === 'OPTIONS' || parseURL.pathname === '/favicon.ico') {
        response.writeHead(200, headers);
        response.end();
    } else if (parseURL.pathname === '/') {
        errorHandler.noFound(response)
    } else if (parseURL.pathname.includes('/activities')) {
        const splitURL = parseURL.pathname.split('/activities/')
        switch (request.method) {
            case 'GET':
                const params = parseURL.query
                getActivities(params, response)
                break;
            case 'POST':
                addActivities(request, response)
                break;
            case 'PUT':
                updateActivities(request, response)
                break;
            case 'DELETE':
                if (splitURL.length > 1 && splitURL[1] !== "") {
                    deleteActivities(splitURL[1], response)
                } else {
                    activities.length = 0
                    response.writeHead(200, headers);
                    response.write(JSON.stringify({
                        data: {
                            status: 'success',
                            data: activities
                        },
                    }));
                    response.end();
                }
                break;
            default:
                errorHandler.noFound(response)
                break;
        }
    } else if (parseURL.pathname.includes('/album')) {
        // const splitURL = parseURL.pathname.split('/album/')
        switch (request.method) {
            case 'GET':
                const querys = parseURL.query
                getAlbums(querys, response)
                break;
            // case 'POST':
            //     addActivities(request, response)
            //     break;
            // case 'PUT':
            //     updateActivities(request, response)
            //     break;
            // case 'DELETE':
            //     if (splitURL.length > 1 && splitURL[1] !== "") {
            //         deleteActivities(splitURL[1], response)
            //     } else {
            //         activities.length = 0
            //         response.writeHead(200, headers);
            //         response.write(JSON.stringify({
            //             data: {
            //                 status: 'success',
            //                 data: activities
            //             },
            //         }));
            //         response.end();
            //     }
            //     break;
            default:
                errorHandler.noFound(response)
                break;
        }
    } else if (parseURL.pathname.includes('/collect')) {
        // const splitURL = parseURL.pathname.split('/collect/')
        switch (request.method) {
            case 'GET':
                const params = parseURL.query
                getCollect(params, response)
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