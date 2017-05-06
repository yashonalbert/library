import { UserModel } from './src/server/models';

const users = ['wms'];

UserModel.update({
  role: 'admin',
}, {
  where: {
    corpUserID: {
      $or: users,
    },
  },
}).then(() => console.log('role success!')).catch((error) => console.log(error));
