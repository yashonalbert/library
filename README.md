# 图书管理

## 简介

本项目使用 Node.js 开发，是一个与企业微信后台关联的图书管理系统，同时拥有 Web 端管理页面和移动端管理页面与用户页面。

## 用法

### 项目部署

```bash
git clone https://github.com/yashonalbert/library // 克隆项目
cd library // 进入项目
npm install // 安装依赖
npm run build-backend // 编译后端
npm run pack //编译前端
node nexe.js //启动后端
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

## 用户
<img src="https://github.com/yashonalbert/szlibrary/blob/master/images/user.png" width="200">
<img src="https://github.com/yashonalbert/szlibrary/blob/master/images/userBook.png" width="200">
<img src="https://github.com/yashonalbert/szlibrary/blob/master/images/book.png" width="200">
<img src="https://github.com/yashonalbert/szlibrary/blob/master/images/userRecords.png" width="200">
<img src="https://github.com/yashonalbert/szlibrary/blob/master/images/lent.png" width="200">
<img src="https://github.com/yashonalbert/szlibrary/blob/master/images/recommend.png" width="200">
