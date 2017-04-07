import moment from 'moment';
import React from 'react';
import { Container, NavBar, List, View } from 'amazeui-touch';
import { Link } from 'react-router';

export default class MyRecords extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return { records: [] };
  }

  getRecords() {
    return fetch('/api/user/records', {
      credentials: 'include'
    }).then((res) => res.json());
  }

  componentWillMount() {
    this.getRecords().then((records) => {
      this.setState({ records });
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

  renderItems() {
    return this.state.records.map((record, index) => {
      return (
        <List.Item
          title={record.book.title}
          subTitle={this.statusFormat(record.status)}
          after={`借阅时间：${moment(record.lentTime).format('YYYY年M月D日')}`}
          linkComponent={Link}
          linkProps={{to: {pathname: `/records/${record.id}`}}}
          {...record}
          key={index}
        />
      );
    });
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title="借阅记录"
        />
        <Container>
          <List className="margin-v-0">
            {this.renderItems()}
          </List>
        </Container>
      </View>
    );
  }
}
