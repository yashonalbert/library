import isUndefined from 'lodash.isundefined';
import React from 'react';
import cookie from 'react-cookie';
import {
  Container,
  Panel,
  Modal,
  ModalTrigger,
  Input,
  Button,
} from 'amazeui-react';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      modal: (<Modal title="default">default</Modal>),
      token: '',
    };
  }

  componentWillMount() {
    if (isUndefined(cookie.load('loggedIn'))) {
      return null;
    }
    return this.context.router.push('/books');
  }

  closeModal() {
    this.setState({
      modal: (<Modal title="default">default</Modal>),
      isModalOpen: false,
      token: '',
    });
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
      if (json.msg === 'login success') {
        return this.context.router.push('/books');
      }
      return this.setState({
        isModalOpen: true,
        modal: (<Modal title="松滋公司职工书屋">登录失败</Modal>),
      });
    });
  }

  render() {
    return (
      <Container>
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
        <ModalTrigger
          modal={this.state.modal}
          show={this.state.isModalOpen}
          onClose={this.closeModal.bind(this)}
        />
      </Container>
    );
  }
}

Login.contextTypes = {
  router: React.PropTypes.func.isRequired,
};

export default Login;
