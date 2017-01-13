/* eslint-disable import/first */

process.env.WorkPath = __dirname;

import assert from 'assert';
import { RecordModel, BookModel, UserModel, sequelize } from '../src/models';

describe('sequelize', () => {
  before((done) => {
    sequelize.sync({ force: true }).then(() => done());
  });
  describe('ready', () => {
    it('UserModel create success', () => {
      const userData = {
        corpUserID: 'wms',
        name: '无名氏',
        department: '测试',
        position: 'sdad',
        mobile: '15527588600',
        gender: 'dfgh',
        email: 'yashonalbert@163.com',
        weixinID: 'y814470240',
        avatar: 'http://shp.qpic.cn/bizmp/TEdkEpz1FictDQ6ib7w20XeiaXp3roJKQ07qdicYvM4JGRicl5rgMvzqTtA/',
        status: 1,
      };
      UserModel.create(userData).then((result) => {
        assert.equal(1, result.id);
      });
    });
    it('BookModel create success', () => {
      const bookInfo = {
        doubanID: '1003078',
        isbn: '9787505715660',
        title: '小王子',
        origin_title: '',
        subtitle: '',
        image: 'https://img3.doubanio.com/mpic/s1001902.jpg',
        author: '（法）圣埃克苏佩里',
        translator: '胡雨苏',
        publisher: '中国友谊出版公司',
        pubdate: '2000-9-1',
        numRaters: 9438,
        averageRating: '9.1',
        summary: '小王子驾到！',
        totalNum: 10,
      };
      return BookModel.create(bookInfo).then((result) => {
        assert.equal(1, result.id);
      });
    });
  });
  describe('RecordModel.create()', () => {
    it('RecordModel create success', () => {
      const recordData = {
        userID: 1,
        bookID: 1,
        status: 'confirming',
      };
      return RecordModel.create(recordData).then((record) => {
        assert.equal(1, record.id);
        return record.getUser();
      }).then((user) => {
        assert.equal(1, user.id);
        return user.getRecords();
      }).then((records) => {
        assert.equal(1, records.length);
        assert.equal(1, records[0].id);
        return RecordModel.getConfirmingRecord();
      }).then((records) => {
        console.log(records.book);
      });
    });
  });
});

