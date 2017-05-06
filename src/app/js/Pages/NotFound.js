import React from 'react';
import { Container, Group } from 'amazeui-touch';

export default class NotFound extends React.Component {
  render() {
    return (
      <Container {...this.props}>
        <Group>
          <h2>页面不存在。</h2>
        </Group>
      </Container>
    );
  }
}
