# 图书管理API

## JS 签名

请求类型 GET

请求路由 /user/jssign

前端通过 GET 请求 /user/jssign 路由，并传递 `debug, jsApiList, url` 参数,后端返回js签名

| 参数 | 说明 |
|---|---|
| debug | 调试模式，默认 false
| jsApiList |
| url | 当前网页的URL

## OAuth2.0 验证

请求类型 GET

请求路由 /user/oauth2

用户首次登录或没有 cookies 时，跳转到 /user/oauth2 路由，路由跳转到微信 oauth2 验证链接获取 code 参数。

微信oauth2验证链接
<https://open.weixin.qq.com/connect/oauth2/authorize?appid=CORPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_base>

| 参数 | 说明 |
|---|---|
| appid | 企业的CorpID
| redirect_uri | 授权后重定向的回调链接地址，请使用 urlencode 对链接进行处理
| response_type | 返回类型，此时固定为 code
| scope | 应用授权作用域，此时固定为 snsapi_base

## 登录授权

请求类型 GET

请求路由 /user/login

通过微信 oauth2 验证链接重定向到 /user/login 路由，并传递 `code` 参数，后端获取用户信息并存入数据库，设置 cookies 跳转到前端

## 用户借书

请求类型 POST

请求路由 /user/records

前端通过 POST 请求 /user/records 路由，表单传递 `bookID` 参数，后端校验后将记录存入数据库并返回记录，发送微信通知给管理员

表单数据
```js
{
	bookID: 1
}
```

正确返回
```js
{
	"id": 1,
	"userID": 1,
	"bookID": 1,
	"status": "confirming",
	"updatedAt": "2017-01-18T15:36:11.961Z",
	"createdAt": "2017-01-18T15:36:11.961Z"
}
```

错误返回
```js
{
	...
}
```

## 用户查阅全部借阅记录

请求类型 GET

请求路由 /user/records

前端通过 GET 请求 /user/records 路由,后端校验后返回当前用户全部借阅记录

正确返回
```js
[
	{
		"id": 1,
		"lentTime": "2017-01-14T21:52:01.455Z",
		"returnTime": null,
		"status": "lent",
		"createdAt": "2017-01-14T21:52:00.768Z",
		"updatedAt": "2017-01-14T21:52:01.455Z",
		"bookID": 1,
		"userID": 1
	},
	...
]
```

错误返回
```js
{
	...
}
```

## 用户查看单条借阅记录

请求类型 GET

请求路由 /user/records/:recordID

前端通过 GET 请求 /user/records 路由,传递 `recordID` 参数 ,后端校验后查询数据库，返回查询结果（单条借阅记录）

param参数说明 recordID 查找记录的id

正确返回
```js
{
	"id": 1,
	"lentTime": "2017-01-14T21:52:01.455Z",
	"returnTime": null,
	"status": "lent",
	"createdAt": "2017-01-14T21:52:00.768Z",
	"updatedAt": "2017-01-14T21:52:01.455Z",
	"bookID": 1,
	"userID": 1
}
```

错误返回
```js
{
	...
}
```

## 管理员查找全部借阅申请

请求类型 GET

请求路由 /users/records

前端通过 GET 请求 /users/records 路由，后端校验后返回所有用户全部借阅申请记录


正确返回
```js
[
	{
		"id": 1,
		"userID": 1,
		"bookID": 1,
		"status": "confirming",
		"updatedAt": "2017-01-18T15:36:11.961Z",
		"createdAt": "2017-01-18T15:36:11.961Z"
	},
	...
]
```

错误返回
```js
{
	...
}
```

## 管理员查看单条申请记录

请求类型 GET

请求路由 /users/records/:recordID

前端通过 GET 请求 /users/records 路由,传递 `recordID` 参数 ,后端校验后查询数据库，返回查询结果（单条申请记录）
正确返回
```js
{
	"id": 1,
	"userID": 1,
	"bookID": 1,
	"status": "confirming",
	"updatedAt": "2017-01-18T15:36:11.961Z",
	"createdAt": "2017-01-18T15:36:11.961Z"
}
```

错误返回
```js
{
	...
}
```

## 管理员处理单个申请

请求类型 POST

请求路由 /users/records/:recordID

前端通过 POST 请求 /users/records/:recordID 路由，表单传递 `action` 参数,后端校验后更新数据库，返回操作状态

表单数据
```js
{
	action: 'allowed' // or rejected
}
```
正确返回
```js
{
	"status": "success"
}
```

错误返回
```js
{
	...
}
```

## 查看单本书的详情

请求类型 GET

请求路由 /books/:bookID

前端通过 GET 请求 /books/:bookID 路由，并传递 `bookID` 参数，后端校验后查询数据库，返回查找结果（单本书详情）

正确返回
```js
{
	"id": 1,
	"doubanID": 1003078,
	"isbn": "9787505715660",
	"title": "小王子",
	"subtitle": "",
	"origin_title": "",
	"author": "（法）圣埃克苏佩里",
	"translator": "胡雨苏",
	"image": "https://img3.doubanio.com/mpic/s1001902.jpg",
	"numRaters": 9438,
	"averageRating": 9.1,
	"pubdate": "2000-9-1",
	"publisher": "中国友谊出版公司",
	"summary": "小王子驾到！",
	"totalNum": 10,
	"createdAt": "2017-01-14T21:52:00.583Z",
	"updatedAt": "2017-01-14T21:52:00.583Z"
}
```

错误返回
```js
{
	...
}
```
