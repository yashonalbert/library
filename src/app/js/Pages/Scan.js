import React from 'react';
import { Container, Group } from 'amazeui-touch';

export default class Scan extends React.Component {
  componentWillMount() {
    const classScan = this;
    const params = {
      jsApiList: ['scanQRCode'].join(','),
      url: location.href.split('#')[0],
    };
    const esc = encodeURIComponent;
    const qs = Object.keys(params).map(k => `${esc(k)}=${esc(params[k])}`).join('&');

    fetch(`api/user/jssign?${qs}`, {
      credentials: 'include',
    }).then((response) => response.json()).then((config) => {
      wx.config(config);
    });

    wx.ready(() => {
      wx.scanQRCode({
        needResult: 1,
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          const isbn = res.resultStr.slice(7);
          switch (classScan.context.location.query.action) {
            case 'auto':
              classScan.context.router.push({
                pathname: '/books/set',
                query: { isbn, action: 'auto' },
              });
              break;
            case 'return':
              classScan.context.router.push({
                pathname: '/records/return',
                query: { isbn },
              });
              break;
            case 'lend':
              classScan.context.router.push({
                pathname: `/books/${isbn}`,
                query: { action: 'lend' },
              });
              break;
            case 'recommend':
              classScan.context.router.push({
                pathname: '/books/recommend',
                query: { isbn, recommend: 'true' },
              });
              break;
            default:
              classScan.context.router.push('/');
              break;
          }
        },
      });
    });
  }

  render() {
    return (
      <Container {...this.props}>
        <Group>
          正在尝试开启摄像头..
        </Group>
      </Container>
    );
  }
}
