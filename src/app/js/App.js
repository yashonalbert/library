import 'whatwg-fetch';

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, withRouter } from 'react-router';
import { Container, TabBar } from 'amazeui-touch';

class App extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  render() {
    const {
      location,
      params,
      children,
      ...props,
    } = this.props;
    const {
      router
    } = this.context;
    const transition = children.props.transition || 'sfl';

    return (
      <Container direction="column" id="container">
        <Container
          transition={transition}
          // fade transition example
          // transition='fade'
          // transitionEnterTimeout={450}
          // transitionLeaveTimeout={300}
        >
          {React.cloneElement(children, {key: location.key})}
        </Container>

        <TabBar
          amStyle="primary"
        >
          <TabBar.Item
            component={Link}
            icon="home"
            title="主页"
            selected={router.isActive('/', true)}
            to="/"
            onlyActiveOnIndex
          />
          <TabBar.Item
            component={Link}
            icon="person"
            title="我的"
            // badge="404"
            // @see https://github.com/reactjs/react-router/blob/0616f6e14337f68d3ce9f758aa73f83a255d6db3/docs/API.md#isactivepathorloc-indexonly
            selected={router.isActive('/records/mine', true)}
            to="/records/mine"
            onlyActiveOnIndex
          />
        </TabBar>
      </Container>
    );
  }
}

// Pages
import Home from './Home';
import SetBook from './Books/SetBook'
import Detail from './Books/Detail';
import Existences from './Books/Existences'
import Recommend from './Books/Recommend';
import BookList from './Books/BookList';
import MyRecords from './Records/MyRecords';
import Record from './Records/Record';
import AllRecords from './Records/AllRecords';
import ReturnBook from './Records/ReturnBook'
import Pages from './Pages/Index';

// withRouter HoC
// @see https://github.com/reactjs/react-router/blob/0616f6e14337f68d3ce9f758aa73f83a255d6db3/upgrade-guides/v2.4.0.md#v240-upgrade-guide
const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="books/all" component={BookList} />
      <Route path="books/set" component={SetBook} />
      <Route path="books/existences" component={Existences} />
      <Route path="books/recommend" component={Recommend} />
      <Route path="books/:bookID" component={Detail} />
      <Route path="records/mine" component={MyRecords} />
      <Route path="records/all" component={AllRecords} />
      <Route path="records/return" component={ReturnBook} />
      <Route path="records/:recordID" component={Record} />
      <Route path=":page" component={Pages} />
    </Route>
  </Router>
);

document.addEventListener('DOMContentLoaded', () => {
  if (!/loggedIn/.test(document.cookie)) {
    return window.location.replace('/api/user/oauth2');
  }
  render(routes, document.getElementById('root'));
});
