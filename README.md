GET /user/oauth2 -> 跳转到 oauth2 页面
GET /user/login -> 从 oauth2 跳回的页面，通过 code 获取用户信息并记录，设置 cookies 跳转到前端

POST /user/records -> 检查登录状态，发出借书申请，传 bookID 过来，后端校验并记录数据库，并发送微信通知给管理员

GET /users/records -> 管理员查阅所有的借阅申请
GET /users/records/:recordID -> 管理员查看单个申请
POST /users/records/:recordID -> 处理单个申请

GET /books/:bookID -> 单本书的详情
