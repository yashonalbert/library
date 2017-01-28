/* eslint-disable import/first */

import config from '../src/utils/config';
import server from '../src/server';
import { RecordModel, BookModel, UserModel, sequelize } from '../src/models';
import assert from 'assert';
import request from 'request';
import nock from 'nock';

describe('Server', () => {
  before((done) => {
    server.listen(config.port);
    sequelize.sync({ force: true }).then(() => done());
  });
  describe('GET /user/login', () => {
    it('login success', (done) => {
      nock('https://qyapi.weixin.qq.com')
        .get('/cgi-bin/gettoken')
        .query({
          corpid: config.wechat.corpid,
          corpsecret: config.wechat.secret,
        })
        .reply(200, {
          access_token: 'ACCESS_TOKEN',
          expires_in: 7200,
        });
      nock('https://qyapi.weixin.qq.com')
        .get('/cgi-bin/user/getuserinfo')
        .query({
          access_token: 'ACCESS_TOKEN',
          code: 'CODE',
          agentid: config.wechat.agentid,
        })
        .reply(200, {
          UserId: 'wms',
          DeviceId: 'DEVICEID',
        });
      nock('https://qyapi.weixin.qq.com')
        .get('/cgi-bin/user/get')
        .query({
          access_token: 'ACCESS_TOKEN',
          userid: 'wms',
        })
        .reply(200, {
          userid: 'wms',
          name: '无名氏',
          department: ['18'],
          position: 'sdad',
          mobile: '15527588600',
          gender: '1',
          email: 'yashonalbert@163.com',
          weixinid: 'y814470240',
          avatar: 'http://shp.qpic.cn/bizmp/TEdkEpz1FictDQ6ib7w20XeiaXp3roJKQ07qdicYvM4JGRicl5rgMvzqTtA/',
          status: 1,
        });
      const j = request.jar();
      const cookie1 = request.cookie('userID=1');
      const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
      const uri = `http://localhost:${config.port}/user/login?code=CODE`;
      j.setCookie(cookie1, uri);
      j.setCookie(cookie2, uri);
      request({
        uri,
        jar: j,
      }, (error, response, body) => {
        assert.equal(body, 'Not Found');
        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });
  describe('GET /user/records', () => {
    it('example book creat success', () => {
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
    it('apply for a book success', (done) => {
      const j = request.jar();
      const cookie1 = request.cookie('userID=1');
      const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
      const uri = `http://localhost:${config.port}/user/records`;
      j.setCookie(cookie1, uri);
      j.setCookie(cookie2, uri);
      request.post({
        uri,
        jar: j,
        form: { bookID: '1' },
        followRedirect: false,
      }, (error, response, body) => {
        assert.equal(JSON.parse(body).id, 1);
        assert.equal(JSON.parse(body).status, 'confirming');
        done();
      });
    });
  });
  describe('GET /users/records', () => {
    it('update user to admin success', () => UserModel.update({
      role: 'admin',
    }, {
      where: { id: 1 },
    }).then((array) => {
      assert.ok(array);
      return UserModel.findOne({
        where: { id: 1 },
      });
    }).then((user) => {
      assert.equal(user.id, 1);
      assert.equal(user.role, 'admin');
    }));
    it('find all records success', (done) => {
      const j = request.jar();
      const cookie1 = request.cookie('userID=1');
      const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
      const uri = `http://localhost:${config.port}/users/records`;
      j.setCookie(cookie1, uri);
      j.setCookie(cookie2, uri);
      request({
        uri,
        jar: j,
        followRedirect: false,
      }, (error, response, body) => {
        assert.equal(JSON.parse(body).length, 1);
        assert.equal(JSON.parse(body)[0].id, 1);
        assert.equal(JSON.parse(body)[0].status, 'confirming');
        done();
      });
    });
  });
  describe('GET /users/records/:recordID', () => {
    it('find a record success', (done) => {
      const j = request.jar();
      const cookie1 = request.cookie('userID=1');
      const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
      const uri = `http://localhost:${config.port}/users/records/1`;
      j.setCookie(cookie1, uri);
      j.setCookie(cookie2, uri);
      request({
        uri,
        jar: j,
        followRedirect: false,
      }, (error, response, body) => {
        assert.equal(JSON.parse(body).id, 1);
        assert.equal(JSON.parse(body).status, 'confirming');
        done();
      });
    });
  });
  describe('POST /users/records/:recordID', () => {
    describe('#reject', () => {
      it('admin reject user request success', (done) => {
        const j = request.jar();
        const cookie1 = request.cookie('userID=1');
        const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
        const uri = `http://localhost:${config.port}/users/records/1`;
        j.setCookie(cookie1, uri);
        j.setCookie(cookie2, uri);
        request.post({
          uri,
          jar: j,
          form: { action: 'rejected' },
          followRedirect: false,
        }, (error, response, body) => {
          assert.deepEqual(JSON.parse(body), { status: 'success' });
          done();
        });
      });
      it('valid status: confirming to rejected', () => RecordModel.findOne({
        where: { id: 1 },
      }).then((record) => {
        assert.equal(record.id, 1);
        assert.equal(record.status, 'rejected');
      }));
    });
    describe('#allowed', () => {
      it('update rejected to confirming success', () => RecordModel.update({
        status: 'confirming',
      }, {
        where: { id: 1 },
      }).then((array) => {
        assert.ok(array);
        return RecordModel.findOne({
          where: { id: 1 },
        });
      }).then((record) => {
        assert.equal(record.id, 1);
        assert.equal(record.status, 'confirming');
      }));
      it('admin allow user request success', (done) => {
        const j = request.jar();
        const cookie1 = request.cookie('userID=1');
        const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
        const uri = `http://localhost:${config.port}/users/records/1`;
        j.setCookie(cookie1, uri);
        j.setCookie(cookie2, uri);
        request.post({
          uri,
          jar: j,
          form: { action: 'allowed' },
          followRedirect: false,
        }, (error, response, body) => {
          assert.deepEqual(JSON.parse(body), { status: 'success' });
          done();
        });
      });
      it('valid status: confirming to lent', () => RecordModel.findOne({
        where: { id: 1 },
      }).then((record) => {
        assert.equal(record.id, 1);
        assert.equal(record.status, 'lent');
      }));
    });
  });
  describe('GET /books/:id', () => {
    it('find bookInfo success', (done) => {
      const j = request.jar();
      const cookie1 = request.cookie('userID=1');
      const cookie2 = request.cookie('userID.sig=7hP1dtvjM5-uWk0bCXNzxJc0Np8');
      const uri = `http://localhost:${config.port}/books/1`;
      j.setCookie(cookie1, uri);
      j.setCookie(cookie2, uri);
      request({
        uri,
        jar: j,
        followRedirect: false,
      }, (error, response, body) => {
        assert.equal(JSON.parse(body).id, 1);
        assert.equal(JSON.parse(body).doubanID, '1003078');
        done();
      });
    });
  });
});
