import 'whatwg-fetch';

import isUndefined from 'lodash.isundefined';
import React, { Component } from 'react';
import {
  render,
} from 'react-dom';
import {
  Router,
  Route,
  IndexRoute,
  hashHistory,
} from 'react-router';
import cookie from 'react-cookie';
import {
  Topbar,
  Nav,
  CollapsibleNav,
  Dropdown,
  Icon,
} from 'amazeui-react';

import RouteLink from './components/RouteLink';
import SiteFooter from './components/SiteFooter';

import Login from './pages/Login';
import Books from './pages/Books';
import Records from './pages/Records';

class App extends Component {
  logStatus() {
    if (isUndefined(cookie.load('loggedIn'))) {
      return '尚未登录';
    }
    return '已登录';
  }

  logout() {
    cookie.remove('userID');
    cookie.remove('userID.sig');
    cookie.remove('loggedIn');
    cookie.remove('loggedIn.sig');
  }

  render() {
    return (
      <div className="ask-page">
        <Topbar
          className="ask-header"
          brand="松滋公司职工书屋"
          inverse
        >
          <CollapsibleNav>
            <Nav topbar>
              <RouteLink to="books">库存管理</RouteLink>
              <RouteLink to="records">借阅管理</RouteLink>
              <Dropdown
                navItem
                title={<span><Icon icon="user" /> {this.logStatus()}</span>}
              >
                <Dropdown.Item closeOnClick>
                  <a href="/web.html" onClick={this.logout.bind(this)}>退出登陆</a>
                </Dropdown.Item>
              </Dropdown>
            </Nav>
          </CollapsibleNav>
        </Topbar>
        <main className="ask-main">
          {this.props.children}
        </main>
        <SiteFooter />
      </div>
    );
  }
}

const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Login} />
      <Route path="books" component={Books} />
      <Route path="records" component={Records} />
    </Route>
  </Router>
);

document.addEventListener('DOMContentLoaded', () => {
  render(routes, document.getElementById('root'));
});
