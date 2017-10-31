import compact from 'lodash.compact';
import React from 'react';
import { Container, NavBar, ButtonGroup, Button, List, Modal, Field, Icon, View } from 'amazeui-touch';
import { Link } from 'react-router';
import Tloader from 'react-touch-loader';

export default class AllRecords extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      page: 1,
      hasMore: 0,
      initializing: 1,
      refreshedAt: Date.now(),
      isSearch: false,
      isModalOpen: false,
      modalContext: '',
      status: 'confirming',
      btnConfirming: 'primary',
      btnLent: 'default',
      keyWord: '',
      records: []
    };
  }

  getRecords(status, page) {
    return fetch(`/api/users/records?status=${status}&page=${page}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  showPanel(status, amStyle) {
    return this.getRecords(status, 1).then((records) => {
      return this.setState({
        ...amStyle,
        page: 1,
        status,
        records
      });
    });
  }

  closeMsg() {
    return this.setState({
      isModalOpen: false,
      modalContext: ''
    });
  }

  componentWillMount() {
    return this.getRecords(this.state.status, 1).then((records) => {
      let hasMore;
      if (records.length < 10) {
        hasMore = 0;
      } else {
        hasMore = 1;
      }
      this.setState({
        page: 1,
        hasMore,
        records
      });
    });
  }

  keyWordChange(event) {
    this.setState({ keyWord: event.target.value });
  }

  searchRecords(page) {
    return fetch(`/api/users/search?keyWord=${this.state.keyWord}&status=${this.state.status}&page=${page}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  handleSearch() {
    this.searchRecords(1).then((records) => {
      this.setState({
        page: 1,
        isSearch: true,
        records
      });
    });
  }

  handleRefresh(resolve, reject) {
    setTimeout(() => {
      this.getRecords(this.state.status, 1).then((records) => {
        let hasMore;
        if (records.length < 10) {
          hasMore = 0;
        } else {
          hasMore = 1;
        }
        this.setState({
          page: 1,
          isSearch: false,
          records,
          hasMore,
          refreshedAt: Date.now()
        });
        resolve();
      });
    }, 1000);
  }

  handleLoadMore(resolve){
    setTimeout(() => {
      let loadPromise;
      if (!this.state.isSearch) {
        loadPromise = this.getRecords(this.state.page + 1);
      } else {
        loadPromise = this.searchRecords(this.state.page + 1);
      }
      return loadPromise.then((records) => {
        let hasMore;
        if (records.length < 10) {
          hasMore = 0;
        } else {
          hasMore = 1;
        }
        records = this.state.records.concat(records);
        this.setState({
          page: this.state.page + 1,
          records,
          hasMore
        });
        resolve();
      });
    }, 1000);
  }

  confirm(action, recordID) {
    return fetch(`/api/users/records/${recordID}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `action=${action}`,
      credentials: 'include'
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'confirm success') {
        const records = compact(this.state.records.map((record) => {
          if (record.id !== recordID) {
            return record
          }
          return null;
        }));
        this.setState({ records });
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
      if (this.state.status === 'confirming') {
        return (
          <List.Item
            title={record.book.title}
            subTitle={`申请人：${record.user.name}`}
            after={
              <ButtonGroup
                hollow
                className="margin-v-0"
                amSize="xs"
              >
                <Button
                  amStyle="success"
                  onClick={this.confirm.bind(this, 'allowed', record.id)}
                >
                  同意
                </Button>
                <Button
                  amStyle="alert"
                  onClick={this.confirm.bind(this, 'rejected', record.id)}
                >
                  拒绝
                </Button>
              </ButtonGroup>
            }
            {...record}
            key={index}
          />
        );
      }
      if (this.state.status === 'lent') {
        return (
          <List.Item
            title={record.book.title}
            subTitle={`借阅时间：${record.lentTime}`}
            after={this.statusFormat(record.status)}
            linkComponent={Link}
            linkProps={{ to: { pathname: `/records/${record.id}` } }}
            {...record}
            key={index}
          />
        );
      }
      return null;
    });
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title={
            <ButtonGroup
              amSize="xs"
              className="margin-v"
            >
              <Button
                amStyle={this.state.btnConfirming}
                onClick={this.showPanel.bind(this, 'confirming', {
                  btnConfirming: 'primary',
                  btnLent: 'default'
                })}
              >
                授权页
              </Button>
              <Button
                amStyle={this.state.btnLent}
                onClick={this.showPanel.bind(this, 'lent', {
                  btnConfirming: 'default',
                  btnLent: 'primary'
                })}
              >
                记录页
              </Button>
            </ButtonGroup>
          }
        />
        <Field
          placeholder="输入借阅人姓名..."
          onChange={this.keyWordChange.bind(this)}
          btnAfter={
            <Button
              amStyle="primary"
              onClick={this.handleSearch.bind(this)}
            >
              <Icon name="search"></Icon>
            </Button>
          }
        />
        <Container scrollable>
          <Tloader
            initializing={this.state.initializing}
            onRefresh={this.handleRefresh.bind(this)}
            hasMore={this.state.hasMore}
            onLoadMore={this.handleLoadMore.bind(this)}
          >
            <List className="margin-v-0">
              {this.renderItems()}
            </List>
          </Tloader>
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
