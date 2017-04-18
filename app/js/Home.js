import React from 'react';
import { Container, List, Icon, Field, Button, NavBar, Group, Switch, View } from 'amazeui-touch';
import { Link } from 'react-router';

export default class Home extends React.Component {
  static defaultProps = {
    transition: 'rfr'
  };

  getInitialState() {
    return {
      isSwitchChecked: null,
      role: '',
      admin: [],
      user: [{
        icon: 'search',
        title: '扫码借阅',
        to: { pathname: '/scan', query: { action: 'lend' } }
      }, {
        icon: 'list',
        title: '查看书库',
        to: { pathname: '/books/existences' }
      },{
        icon: 'pages',
        title: '图书推荐',
        to: { pathname: '/books/recommend' }
      }]
    };
  }

  getUserInfo() {
    return fetch('/api/user/userInfo', {
      credentials: 'include'
    }).then((res) => res.json());
  }

  componentWillMount() {
    this.getUserInfo().then((res) => {
      this.setState({ role: res.role });
      if (res.role === 'admin') {
        this.setState({
          admin: [{
            icon: 'search',
            title: '扫码入库',
            to: { pathname: '/scan', query: { action: 'auto' } }
          }, {
            icon: 'plus',
            title: '手动入库',
            to: { pathname: '/books/set', query: { action: 'manual' } }
          }, {
            icon: 'gear',
            title: '图书管理',
            to: { pathname: '/books/all' }
          }, {
            icon: 'list',
            title: '记录监控',
            to: { pathname: '/records/all' }
          }, {
            icon: 'search',
            title: '扫码还书',
            to: { pathname: '/scan', query: { action: 'return' } }
          }]
        });
      }
      if (res.message === 'on') {
        this.setState({ isSwitchChecked: true });
      } else {
        this.setState({ isSwitchChecked: false });
      }
      return null;
    })
  }

  renderAdminItem() {
    return this.state.admin.map((option, index) => {
      return (
        <List.Item
          media={<Icon name={option.icon} />}
          title={option.title}
          linkComponent={Link}
          linkProps={ {to: option.to } }
        />
      );
    });
  }

  adminHeader() {
    if (this.state.role === 'admin') return (<List.Item role="header">管理员选项</List.Item>);
  }

  handleSwitch(event) {
    if (event.target.checked) {
      fetch(`/api/users/messageSet`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `status=on`,
        credentials: 'include'
      }).then((res) => res.json())
    } else {
      fetch(`/api/users/messageSet`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `status=off`,
        credentials: 'include'
      }).then((res) => res.json())
    }
  }

  sendSwitch(){
    if (this.state.role === 'admin') {
      return (
        <List.Item
          media={<Icon name="info" />}
          title="接收消息"
          after={
            <Switch
              onValueChange={(this.handleSwitch.bind(this))}
              value={this.state.isSwitchChecked}
            />
          }
        />
      );
    }
  }

  renderUserItem() {
    return this.state.user.map((option, index) => {
      return (
        <List.Item
          media={<Icon name={option.icon} />}
          title={option.title}
          linkComponent={Link}
          linkProps={ {to: option.to } }
        />
      );
    });
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title="松滋公司职工书屋"
        />
        <Container scrollable>
          <List className="margin-v-0">
            {this.adminHeader()}
            {this.sendSwitch()}
            {this.renderAdminItem()}
          </List>
          <List className="margin-v-0">
            <List.Item role="header">用户选项</List.Item>
            {this.renderUserItem()}
          </List>
        </Container>
      </View>
    );
  }
}
