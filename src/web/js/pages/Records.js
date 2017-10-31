import compact from 'lodash.compact';
import isUndefined from 'lodash.isundefined';
import cookie from 'react-cookie';
import React from 'react';
import {
  Container,
  Grid,
  Col,
  ButtonGroup,
  ButtonToolbar,
  Button,
  Modal,
  ModalTrigger,
  Article,
  Badge,
  Image,
  Table,
  Input,
} from 'amazeui-react';

class Records extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      goPage: 1,
      count: 0,
      status: 'confirming',
      btnConfirming: 'primary',
      btnLent: 'default',
      isSearch: false,
      isModalOpen: false,
      modal: (<Modal title="default">default</Modal>),
      keyWord: '',
      records: [],
    };
  }

  componentWillMount() {
    if (isUndefined(cookie.load('loggedIn'))) {
      this.context.router.push('/');
    }
    return this.getRecords(this.state.status, 1).then((records) => {
      this.getCount('all', this.state.status).then((count) => {
        this.setState({
          count: count.count,
          page: 1,
          goPage: 1,
          records,
        });
      });
    });
  }

  getRecords(status, page) {
    return fetch(`/api/users/records?status=${status}&page=${page}`, {
      credentials: 'include',
    }).then((res) => res.json());
  }

  getCount(action, status) {
    if (action === 'all') {
      return fetch(`/api/users/count?status=${status}`, {
        credentials: 'include',
      }).then((res) => res.json());
    }
    if (action === 'search') {
      return fetch(`/api/users/count?keyWord=${this.state.keyWord}&status=${status}`, {
        credentials: 'include',
      }).then((res) => res.json());
    }
    return Promise.resolve({ count: 0 });
  }

  closeModal() {
    this.setState({
      modal: (<Modal title="default">default</Modal>),
      isModalOpen: false,
    });
  }

  showPanel(status, amStyle) {
    return this.getRecords(status, 1).then((records) => {
      this.getCount('all', status).then((count) => {
        this.setState({
          btnConfirming: amStyle.btnConfirming,
          btnLent: amStyle.btnLent,
          isSearch: false,
          count: count.count,
          page: 1,
          goPage: 1,
          status,
          records,
        });
      });
    });
  }

  keyWordChange(event) {
    this.setState({ keyWord: event.target.value });
  }

  searchRecords(page) {
    return fetch(`
      /api/users/search?keyWord=${this.state.keyWord}&status=${this.state.status}&page=${page}
    `, {
      credentials: 'include',
    }).then((res) => res.json());
  }

  handleSearch() {
    this.searchRecords(1).then((records) => {
      this.setState({
        page: 1,
        goPage: 1,
        isSearch: true,
        records,
      });
    });
  }

  pageChange(event) {
    this.setState({ goPage: event.target.value });
  }

  handlePage(action) {
    let page;
    if (action === 'previous') {
      if (this.state.page === 1) {
        return this.setState({
          isModalOpen: true,
          modal: (<Modal title="图书馆">已经是第一页了</Modal>),
        });
      }
      page = this.state.page - 1;
    }
    if (action === 'next') {
      if (this.state.page === Math.ceil(this.state.count / 10)) {
        return this.setState({
          isModalOpen: true,
          modal: (<Modal title="图书馆">已经是最后一页了</Modal>),
        });
      }
      page = this.state.page + 1;
    }
    if (action === 'go') {
      if (this.state.goPage > 1 || this.state.goPage < Math.ceil(this.state.count / 10) || !Number.isInteger(Number(this.state.goPage))) {
        return this.setState({
          isModalOpen: true,
          modal: (<Modal title="图书馆">页数应在1-{Math.ceil(this.state.count / 10)}之间</Modal>),
        });
      }
      page = this.state.goPage;
    }
    if (this.state.isSearch) {
      return this.getRecords(this.state.status, page).then((records) => {
        this.getCount('search', this.state.status).then((count) => {
          this.setState({
            count: count.count,
            page,
            goPage: page,
            records,
          });
        });
      });
    }
    return this.getRecords(this.state.status, page).then((records) => {
      this.getCount('all', this.state.status).then((count) => {
        this.setState({
          count: count.count,
          page,
          goPage: page,
          records,
        });
      });
    });
  }

  confirm(action, recordID) {
    return fetch(`/api/users/records/${recordID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `action=${action}`,
      credentials: 'include',
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'confirm success') {
        const records = compact(this.state.records.map((record) => {
          if (record.id !== recordID) {
            return record;
          }
          return null;
        }));
        this.setState({
          count: this.state.count - 1,
          records,
        });
      } else {
        this.setState({
          isModalOpen: true,
          modal: (<Modal title="图书馆">操作失败</Modal>),
        });
      }
    });
  }

  showBook(book) {
    const modal = (
      <Modal title="图书详情">
        <Article
          title={book.title}
          meta={`豆瓣评分：${book.averageRating}（${book.numRaters}人评分）`}
        >
          <div className="am-cf am-margin-horizontal-xl">
            <p className="am-text-left am-text-sm am-align-left">
              ISBN：{book.isbn}<br />
              副标题：{book.subtitle}<br />
              原标题：{book.origin_title}<br />
              作者：{book.author}<br />
              翻译：{book.translator}<br />
              出版社：{book.publisher}<br />
              出版日期：{book.pubdate}<br />
              价格：{book.price}
            </p>
            <p className="am-align-right">
              <Image src={book.image} />
            </p>
          </div>
          <Button radius block amStyle="primary" href={book.alt}>豆瓣详情</Button>
          <Article.Child className="am-text-left" role="lead">
            {book.summary}
          </Article.Child>
        </Article>
      </Modal>
    );
    this.setState({
      modal,
      isModalOpen: true,
    });
  }

  statusFormat(status) {
    switch (status) {
      case 'lent':
        return (<Badge amStyle="primary" radius>借阅中</Badge>);
      case 'returned':
        return (<Badge amStyle="success" radius>已归还</Badge>);
      case 'outdated':
        return (<Badge amStyle="danger" radius>逾期</Badge>);
      default:
        return null;
    }
  }

  renderItems() {
    return this.state.records.map((record) => {
      if (this.state.status === 'confirming') {
        return (
          <tr>
            <td>{record.book.title}</td>
            <td>{record.user.name}</td>
            <td>{record.user.mobile}</td>
            <td><Badge amStyle="warning" radius>未授权</Badge></td>
            <td />
            <td />
            <td />
            <td>
              <ButtonToolbar>
                <Button
                  radius
                  amStyle="success"
                  amSize="xs"
                  onClick={this.confirm.bind(this, 'allowed', record.id)}
                >
                  同意
                </Button>
                <Button
                  radius
                  amStyle="danger"
                  amSize="xs"
                  onClick={this.confirm.bind(this, 'rejected', record.id)}
                >
                  拒绝
                </Button>
              </ButtonToolbar>
            </td>
          </tr>
        );
      }
      if (this.state.status === 'lent') {
        return (
          <tr>
            <td>{record.book.title}</td>
            <td>{record.user.name}</td>
            <td>{record.user.mobile}</td>
            <td>{this.statusFormat(record.status)}</td>
            <td>{record.lentTime}</td>
            <td>{record.expiryTime}</td>
            <td>{record.returnTime}</td>
            <td>
              <Button
                radius
                amStyle="primary"
                amSize="xs"
                onClick={this.showBook.bind(this, record.book)}
              >
                书籍详情
              </Button>
            </td>
          </tr>
        );
      }
      return null;
    });
  }

  render() {
    return (
      <Container className="am-padding-top">
        <Grid className="doc-g">
          <Col md={4}>
            <ButtonGroup>
              <Button
                radius
                amStyle={this.state.btnConfirming}
                onClick={this.showPanel.bind(this, 'confirming', {
                  btnConfirming: 'primary',
                  btnLent: 'default',
                })}
              >
                授权页
              </Button>
              <Button
                radius
                amStyle={this.state.btnLent}
                onClick={this.showPanel.bind(this, 'lent', {
                  btnConfirming: 'default',
                  btnLent: 'primary',
                })}
              >
                记录页
              </Button>
            </ButtonGroup>
          </Col>
          <Col md={4} mdOffset={4}>
            <Input
              radius
              icon="search"
              onChange={this.keyWordChange.bind(this)}
              btnAfter={
                <Button
                  radius
                  amStyle="primary"
                  onClick={this.handleSearch.bind(this)}
                >
                  搜索
                </Button>
              }
            />
          </Col>
        </Grid>
        <Table compact hover>
          <thead>
            <tr>
              <th>标题</th>
              <th>申请人</th>
              <th>联系电话</th>
              <th>书籍状态</th>
              <th>借阅日期</th>
              <th>到期日期</th>
              <th>还书日期</th>
              <th>管理</th>
            </tr>
          </thead>
          <tbody>
            {this.renderItems()}
          </tbody>
        </Table>
        <Grid className="doc-g">
          <Col md={1} mdOffset={7}>
            <Button
              radius
              amStyle="primary"
              onClick={this.handlePage.bind(this, 'previous')}
            >
              上一页
            </Button>
          </Col>
          <Col md={1}>
            <Button
              radius
              amStyle="primary"
              onClick={this.handlePage.bind(this, 'next')}
            >
              下一页
            </Button>
          </Col>
          <Col md={3}>
            <Input
              radius
              btnBefore={
                <Button
                  radius
                  amStyle="primary"
                  onClick={this.handlePage.bind(this, 'go')}
                >
                  跳转
                </Button>}
              addonAfter={`共${Math.ceil(this.state.count / 10)}页`}
              onChange={this.pageChange.bind(this)}
              value={this.state.goPage}
            />
          </Col>
        </Grid>
        <ModalTrigger
          modal={this.state.modal}
          show={this.state.isModalOpen}
          onClose={this.closeModal.bind(this)}
        />
      </Container>
    );
  }
}

Records.contextTypes = {
  router: React.PropTypes.func.isRequired,
};

export default Records;
