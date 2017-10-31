# 图书管理

## 简介

本项目使用 Node.js 开发，是一个与企业微信后台关联的图书管理系统，同时拥有 Web 端管理页面和移动端管理页面与用户页面。

- [API入口](https://github.com/yashonalbert/library/blob/master/API.md)
- 后端采用 `Promise` 风格编写，使用 `Koa` 框架搭建服务路由，使用 `Sequelize` 构建 `SQLite` 数据库模型，用外键关联多表，用事务来保持并发一致性，用队列完成批量入库功能，确保爬虫爬取数据准确无重复。
- 提供 `RESTful` 风格的 API，用户系统支持 `OAuth2`"
使用 `Sentry` 进行错误监控，并使用 `Log4js` 在本地记录日志
- WEB端使用 `AmazeUI-React`, 移动端使用 `AmazeUI-Touch` ,并使用 `WebPack` / `Gulp` 进行打包处理
- 使用 `Electron` 打包为桌面应用程序"

## 用法

### 项目部署

```sh
$ git clone https://github.com/yashonalbert/library // 克隆项目
$ cd library // 进入项目
$ npm install // 安装依赖
$ npm run build-backend // 编译后端
$ npm run pack //编译前端
$ node nexe.js //启动后端
```

### 配置文件

```js
{
  "domain": "example.com", // 项目域名
  "port": 3000, // 端口号
  "database": "/path/to/library.sqlite.", // 数据库文件路径
  "wechat": {
    "corpid": "",
    "secret": "",
    "agentid": "" // 项目编号
  },
  "logs_dir": "/path/to/logs", // 日志文件路径
  "raven": "" // Sentry错误处理url
}
```

## 移动端

### 用户页面
<p float="left" align="center">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/user.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/userBooks.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/book.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/userRecords.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/lent.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/recommend.png" width="250">
</p>

### 管理员页面

<p float="left" align="center">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/admin.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/setBook.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/adminBooks.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/msgLent.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/authorization.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/adminRecords.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/return.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/lentInfo.png" width="250">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/webCode.png" width="250">
</p>

## Web端

### 管理员页面

<p align="center">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/login.png">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/webBooks.png">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/batch.png">
  <img src="https://github.com/yashonalbert/szlibrary/blob/master/images/webRecords.png">
</p>
