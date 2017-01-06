window.onload = function(){
  switch ($('.page-header')[0].textContent) {
    case ('主页'):
      $('#index').addClass('active');
      break;
    case ('管理员组'):
      $('#adminGroup').addClass('active');
      break;
    case ('管理员'):
      $('#adminUser').addClass('active');
      break;
    case ('图书清单'):
      $('#bookList').addClass('active');
      break;
    case ('借出清单'):
      $('#lendList').addClass('active');
      break;
    case ('系统日志'):
      $('#log').addClass('active');
      break;
    case ('用户管理'):
      $('#user').addClass('active');
      break;
    default:
  }
};
