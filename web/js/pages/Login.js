import isUndefined from 'lodash.isundefined';
import React from 'react';
import cookie from 'react-cookie';
import {
  Container,
  Panel,
  Input,
  Button,
} from 'amazeui-react';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
    };
  }

  componentWillMount() {
    if (isUndefined(cookie.load('loggedIn'))) {
      return null;
    }
    return this.context.router.push('/books');
  }

  tokenChange(event) {
    this.setState({ token: event.target.value });
  }

  checkToken() {
    return fetch('/api/users/checkToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `token=${this.state.token}`,
      credentials: 'include',
    }).then((res) => res.json()).then((json) => {
      cookie.save('userID', json.userID);
      cookie.save('userID.sig', json['userID.sig']);
      cookie.save('loggedIn', json.loggedIn);
      cookie.save('loggedIn.sig', json['loggedIn.sig']);
      return this.context.router.push('/books');
    });
  }

  render() {
    return (
      <Container className="">
        <Panel className="panel-margin">
          <h2 className="am-text-center">松滋公司职工书屋登录页面</h2>
          <Input
            radius
            type="text"
            label="请输入移动端验证码"
            onChange={this.tokenChange.bind(this)}
          />
          <Button
            radius
            block
            className="am-margin-top"
            amStyle="primary"
            onClick={this.checkToken.bind(this)}
          >
            登录
          </Button>
        </Panel>
      </Container>
    );
  }
}

Login.contextTypes = {
  router: React.PropTypes.func.isRequired,
};

export default Login;
