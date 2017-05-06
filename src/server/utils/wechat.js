import Wechat from 'wechat-enterprise-api';
import config from './config';

const wechat = new Wechat(config.wechat.corpid, config.wechat.secret, config.wechat.agentid);

export default wechat;
