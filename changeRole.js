import { UserModel } from './src/models';

UserModel.update({
  role: 'admin',
}, {
  where: {
    corpUserID: 'wms',
  },
}).then(() => console.log('change ok!'));
