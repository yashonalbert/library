import React from 'react';
import { View, NavBar } from 'amazeui-touch';
import { Link } from 'react-router';

import NotFound from './NotFound';
import Scan from './Scan';

const pages = {
  Scan,
};

class Pages extends React.Component {
  render() {
    let page = this.props.params.page;
    if (page) {
      page = page.charAt(0).toUpperCase() + page.slice(1);
    }

    const Component = pages[page] || NotFound;
    const backNav = {
      component: Link,
      icon: 'left-nav',
      title: '返回',
      to: '/',
      onlyActiveOnIndex: true,
    };

    return (
      <View>
        <NavBar
          title={page}
          leftNav={[backNav]}
          amStyle="primary"
        />
        <Component scrollable />
      </View>
    );
  }
}

export default Pages;
