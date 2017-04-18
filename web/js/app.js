import 'whatwg-fetch';

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

import {
  Topbar,
  Nav,
  CollapsibleNav,
  Dropdown,
  Icon,
} from 'amazeui-react';

import RouteLink from './components/RouteLink';
import SiteFooter from './components/SiteFooter';

class App extends Component {
  render() {
    return (
      <div className="ask-page">
        <Topbar
          className="ask-header"
          brand="松滋公司职工书屋"
          brandLink="/"
          inverse
        >
          <CollapsibleNav>
            <Nav topbar>
              <RouteLink to="books">库存管理</RouteLink>
              <RouteLink to="records">借阅管理</RouteLink>
              <Dropdown
                navItem
                title={<span><Icon icon="user" /> sss</span>}
              >
                <Dropdown.Item>退出</Dropdown.Item>
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

// Pages
import Login from './pages/Login';
import Books from './pages/Books';
import Records from './pages/Records';

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
