# todolist test
[render service](https://node-todo-test.onrender.com/)

## postman Variable
base_url設定
dev: http://localhost:8081
render: https://node-todo-test.onrender.com/

## todos RESTful API

#### Get
* `/todos`                : Get todos
* `/todos?uid=xxx`        : Todos filter by a uid
* `/todos?uid=xxx&statu=0`: Todos filter by uid and statu

#### POST
* `/todos`                : Create a new project

#### PUT
* `/todos/:uid`           : Update project 

#### DELETE
* `/todos`                : Delete all project
* `/todos/:uid`           : Delete a project



## step

1. 初始化npm
```
npm init
```

2. 安裝uuid
```sh
npm install uuid --save
```


