import React from 'react';
import { Container, NavBar, List, Button, Modal, View } from 'amazeui-touch';

export default class ReturnBook extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      isModalOpen: false,
      modalContext: '',
      records: []
    };
  }

  getRecords() {
    return fetch(`/api/users/records?isbn=${this.props.location.query.isbn}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  closeMsg() {
    return this.setState({
      isModalOpen: false,
      modalContext: ''
    });
  }

  componentWillMount() {
    this.getRecords().then((records) => {
      this.setState({ records });
    });
  }

  returnBook(recordID) {
    return fetch('/api/users/records', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `recordID=${recordID}`,
      credentials: 'include'
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'return success') {
        this.getRecords().then((records) => this.setState({ records }));
      } else if (json.msg === 'record not found') {
        this.setState({
          isModalOpen: true,
          modalContext: '没有记录。'
        });
      } else {
        this.setState({
          isModalOpen: true,
          modalContext: '操作失败。'
        });
      }
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
          subTitle={
            <p className="text-normal">
              借阅人：{record.user.name}<br/>
              状态：{this.statusFormat(record.status)}<br/>
              借阅日期：{record.lentTime}
            </p>
          }
          after={
            <Button
              hollow
              className="margin-0"
              amSize="xs"
              amStyle="success"
              onClick={this.returnBook.bind(this, record.id)}
            >
              还书
            </Button>}
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
          title="请选择项目"
        />
        <Container scrollable>
          <List className="margin-v-0">
            {this.renderItems()}
          </List>
        </Container>
        <Modal
          role="alert"
          title="图书馆"
          isOpen={this.state.isModalOpen}
          onDismiss={this.closeMsg.bind(this)}
        >
          {this.state.modalContext}
        </Modal>
      </View>
    );
  }
}
