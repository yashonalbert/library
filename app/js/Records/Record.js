import moment from 'moment';
import React from 'react';
import { Container, NavBar, Group, Grid, Col, List, View } from 'amazeui-touch';

export default class Record extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      record: {
        book: {},
        user: {}
      }
    };
  }

  getRecord() {
    return fetch(`/api/users/records/${this.props.params.recordID}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  componentWillMount() {
    this.getRecord().then((record) => {
      this.setState({ record });
    });
  }

  statusFormat(status) {
    switch (status) {
      case 'lent':
        return '借阅中';
      case 'returned':
        return '已归还';
      case 'outdated':
        return '逾期'
      default:
        break;
    }
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title="借阅记录"
        />
        <Container scrollable>
          <Group className="margin-v-0">
            <Grid collapse wrap="wrap">
              <Col cols={6}>
                <h3>{this.state.record.book.title}</h3>
              </Col>
              <Col cols={4}>
                <p className="text-normal">
                  豆瓣评分：{this.state.record.book.averageRating}（{this.state.record.book.numRaters}人评分）<br/>
                  ISBN：{this.state.record.book.isbn}<br/>
                  副标题：{this.state.record.book.subtitle}<br/>
                  原标题：{this.state.record.book.origin_title}<br/>
                  作者：{this.state.record.book.author}<br/>
                  翻译：{this.state.record.book.translator}<br/>
                  出版社：{this.state.record.book.publisher}<br/>
                  出版日期：{this.state.record.book.pubdate}<br/>
                  价格：{this.state.record.book.price}
                </p>
              </Col>
              <Col cols={2}>
                <img width="115" src={this.state.record.book.image}/>
              </Col>
              <Col cols={6}>
                <p className="text-normal">
                  借阅人：{this.state.record.user.name}<br/>
                  书籍状态：{this.statusFormat(this.state.record.status)}<br/>
                  借阅日期：{moment(this.state.record.lentTime).format('YYYY年M月D日')}<br/>
                  到期日期：{moment(this.state.record.lentTime).format('YYYY年M月D日')}
                </p>
              </Col>
            </Grid>
          </Group>
        </Container>
      </View>
    );
  }
}
