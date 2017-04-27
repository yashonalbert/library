/* eslint-disable max-len */

import _ from 'lodash';
import Promise from 'bluebird';
import request from 'request-promise';
import logger from './logger';
import { BookModel, RecordModel, UserModel, QueueModel } from '../models';

const loggerSchedule = logger('schedule');

let pauseTime = new Date(0);

function spider() {
  return QueueModel.findOne({
    where: {
      isQueue: true,
    },
    limit: 1,
  }).then((queue) => {
    if (_.isNull(queue)) {
      return Promise.resolve();
    }
    const now = new Date();
    if (pauseTime.valueOf() + (60 * 60 * 1000) > now.valueOf()) {
      return Promise.resolve();
    }
    return request({
      uri: `https://api.douban.com//v2/book/isbn/${queue.isbn}`,
      json: true,
    }).then((parsedBody) => {
      const book = {
        doubanID: parsedBody.id,
        isbn: parsedBody.isbn13,
        title: parsedBody.title,
        origin_title: parsedBody.origin_title,
        subtitle: parsedBody.subtitle,
        alt: parsedBody.alt,
        image: parsedBody.image,
        author: parsedBody.author.toString(),
        translator: parsedBody.translator.toString(),
        publisher: parsedBody.publisher,
        pubdate: parsedBody.pubdate,
        numRaters: parsedBody.rating.numRaters,
        averageRating: parsedBody.rating.average,
        price: parsedBody.price,
        totalNum: queue.num,
        summary: parsedBody.summary,
      };
      return BookModel.create(book);
    }).then(() => queue.destroy()).catch((error) => {
      if (error.message === '') {
        pauseTime = new Date();
        return Promise.recjet();
      }
      loggerSchedule.info(error.message);
      return queue.update({ isQueue: false });
    });
  });
}

function guard() {
  return RecordModel.findAll({
    where: { status: 'lent' },
    include: [{
      model: BookModel,
      as: 'book',
    }, {
      model: UserModel,
      as: 'user',
    }],
  }).then((records) => {
    if (records.length === 0) {
      return Promise.resolve();
    }
    const expiryBefore = [];
    const expiryAfter = [];
    records.map((record) => {
      if (_.isNull(record.noticTime)) {
        return null;
      }
      if (record.noticTime.valueOf() === record.expiryTime.valueOf()) {
        return expiryAfter.push(record);
      }
      if (record.noticTime <= new Date()) {
        return expiryBefore.push(record);
      }
      return null;
    });
    return Promise.map(expiryAfter, (record) => record.update({ noticTime: null }))
      .then((afterItems) => Promise.map(afterItems, (afterItem) => RecordModel.sendNotification('expiryAfter', afterItem)))
      .then(() => Promise.map(expiryBefore, (record) => record.update({ noticTime: record.expiryTime })))
      .then((beforeItems) => Promise.map(beforeItems, (beforeItem) => RecordModel.sendNotification('expiryBefore', beforeItem)));
  }).catch((error) => loggerSchedule.info(error.message));
}

export { spider, guard };
