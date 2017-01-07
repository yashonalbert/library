import Wechat from 'wechat-enterprise-api';

const { config } = global.app;

const wechat = Wechat(config.wechat.corpid, config.wechat.secret, config.wechat.agentid);

export default wechat;
