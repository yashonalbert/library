import _ from 'lodash';
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
  Image,
  Icon,
  Table,
  Input,
} from 'amazeui-react';

class Books extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      goPage: 1,
      count: 0,
      status: 'existence',
      btnExistence: 'primary',
      btnInexistence: 'default',
      formAction: '',
      isSearch: false,
      isModalOpen: false,
      modal: (<Modal title="default">default</Modal>),
      keyWord: '',
      books: [],
      book: {},
    };
  }

  componentWillMount() {
    return this.getBooks(this.state.status, 1).then((books) => {
      this.getCount('all', this.state.status).then((count) => {
        this.setState({
          count: count.count,
          page: 1,
          goPage: 1,
          books,
        });
      });
    });
  }

  getBooks(status, page) {
    return fetch(`/api/books/bookList?status=${status}&page=${page}`, {
      credentials: 'include',
    }).then((res) => res.json());
  }

  getCount(action, status) {
    if (action === 'all') {
      return fetch(`/api/books/count?status=${status}`, {
        credentials: 'include',
      }).then((res) => res.json());
    }
    if (action === 'search') {
      return fetch(`/api/books/count?keyWord=${this.state.keyWord}&status=${status}`, {
        credentials: 'include',
      }).then((res) => res.json());
    }
    return Promise.resolve({ count: 0 });
  }

  setBook() {
    const book = Object.keys(this.state.book).map(key => `${key}=${this.state.book[key]}&`)
      .toString()
      .replace(/,/g, '');
    return fetch('/api/books/setBook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `${book}action=${this.state.formAction}`,
      credentials: 'include',
    }).then((res) => res.json()).then((json) => {
      switch (json.msg) {
        case 'set success':
          this.setState({
            isModalOpen: true,
            modal: (<Modal title="松滋公司职工书屋">提交成功</Modal>),
            book: {},
          });
          break;
        case 'stock over limit':
          this.setState({
            isModalOpen: true,
            modal: (<Modal title="松滋公司职工书屋">库存不能低于最小值</Modal>),
          });
          break;
        default:
          this.setState({
            isModalOpen: true,
            modal: (<Modal title="松滋公司职工书屋">操作失败</Modal>),
          });
          break;
      }
    });
  }

  closeModal() {
    this.setState({
      modal: (<Modal title="default">default</Modal>),
      isModalOpen: false,
      book: {},
    });
  }

  showPanel(status, amStyle) {
    return this.getBooks(status, 1).then((books) => {
      this.getCount('all', status).then((count) => {
        this.setState({
          btnExistence: amStyle.btnExistence,
          btnInexistence: amStyle.btnInexistence,
          isSearch: false,
          count: count.count,
          page: 1,
          goPage: 1,
          status,
          books,
        });
      });
    });
  }

  keyWordChange(event) {
    this.setState({ keyWord: event.target.value });
  }

  searchBooks(page) {
    return fetch(`
      /api/books/search?keyWord=${this.state.keyWord}&status=${this.state.status}&page=${page}
    `, {
      credentials: 'include',
    }).then((res) => res.json());
  }

  handleSearch() {
    return this.searchBooks(1).then((books) => {
      this.getCount('search', this.state.status).then((count) => {
        this.setState({
          count: count.count,
          page: 1,
          goPage: 1,
          isSearch: true,
          books,
        });
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
          modal: (<Modal title="松滋公司职工书屋">已经是第一页了</Modal>),
        });
      }
      page = this.state.page - 1;
    }
    if (action === 'next') {
      if (this.state.page === Math.ceil(this.state.count / 10)) {
        return this.setState({
          isModalOpen: true,
          modal: (<Modal title="松滋公司职工书屋">已经是最后一页了</Modal>),
        });
      }
      page = this.state.page + 1;
    }
    if (action === 'go') {
      if (this.state.goPage < 1 && this.state.goPage || Math.ceil(this.state.count / 10) || !Number.isInteger(this.state.goPage)) {
        return this.setState({
          isModalOpen: true,
          modal: (<Modal title="松滋公司职工书屋">页数应在1-{Math.ceil(this.state.count / 10)}之间</Modal>),
        });
      }
      page = this.state.goPage;
    }
    if (this.state.isSearch) {
      return this.getBooks(this.state.status, page).then((books) => {
        this.getCount('search', this.state.status).then((count) => {
          this.setState({
            count: count.count,
            page,
            goPage: page,
            books,
          });
        });
      });
    }
    return this.getBooks(this.state.status, page).then((books) => {
      this.getCount('all', this.state.status).then((count) => {
        this.setState({
          count: count.count,
          page,
          goPage: page,
          books,
        });
      });
    });
  }

  showForm(book, action) {
    this.setState({
      status: 'form',
      formAction: action,
      book,
    });
  }

  bookChange(key, event) {
    const book = this.state.book;
    book[key] = event.target.value;
    this.setState({ book });
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

  changeStatus(action, bookID) {
    return fetch(`/api/books/${bookID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `action=${action}`,
      credentials: 'include',
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'change success') {
        const books = _.compact(this.state.books.map((book) => {
          if (book.id !== bookID) {
            return book;
          }
          return null;
        }));
        this.setState({
          count: this.state.count - 1,
          books,
        });
      } else if (json.msg === 'lentCount > 0') {
        this.setState({
          isModalOpen: true,
          modal: (<Modal title="松滋公司职工书屋">书籍有借出状态，不可删除。</Modal>),
        });
      } else {
        this.setState({
          isModalOpen: true,
          modal: (<Modal title="松滋公司职工书屋">操作失败</Modal>),
        });
      }
    });
  }

  renderFrom() {
    if (this.state.status === 'form') {
      return (
        <Grid className="doc-g am-margin">
          <Col md={8}>
            <Col md={6}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="标题"
                defaultValue={this.state.book.title}
                onChange={this.bookChange.bind(this, 'title')}
              />
            </Col>
            <Col md={6}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="副标题"
                defaultValue={this.state.book.subtitle}
                onChange={this.bookChange.bind(this, 'subtitle')}
              />
            </Col>
            <Col md={12}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="原标题"
                defaultValue={this.state.book.origin_title}
                onChange={this.bookChange.bind(this, 'origin_title')}
              />
            </Col>
            <Col md={6}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="作者" d
                defaultValue={this.state.book.author}
                onChange={this.bookChange.bind(this, 'author')}
              />
            </Col>
            <Col md={6}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="翻译"
                defaultValue={this.state.book.translator}
                onChange={this.bookChange.bind(this, 'translator')}
              />
            </Col>
          </Col>
          <Col md={4}>
            <Image className="am-margin" src={this.state.book.image} />
          </Col>
          <Col md={12}>
            <Col md={4}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="ISBN"
                defaultValue={this.state.book.isbn}
                onChange={this.bookChange.bind(this, 'isbn')}
              />
            </Col>
            <Col md={4}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="出版社"
                defaultValue={this.state.book.publisher}
                onChange={this.bookChange.bind(this, 'publisher')}
              />
            </Col>
            <Col md={4}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="出版日期"
                defaultValue={this.state.book.pubdate}
                onChange={this.bookChange.bind(this, 'pubdate')}
              />
            </Col>
            <Col md={3}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="评分人数"
                defaultValue={this.state.book.numRaters}
                onChange={this.bookChange.bind(this, 'numRaters')}
              />
            </Col>
            <Col md={3}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="豆瓣评分"
                defaultValue={this.state.book.averageRating}
                onChange={this.bookChange.bind(this, 'averageRating')}
              />
            </Col>
            <Col md={3}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="价格"
                defaultValue={this.state.book.price}
                onChange={this.bookChange.bind(this, 'price')}
              />
            </Col>
            <Col md={3}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="数量"
                defaultValue={this.state.book.totalNum}
                onChange={this.bookChange.bind(this, 'totalNum')}
              />
            </Col>
            <Col md={6}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="图片"
                defaultValue={this.state.book.image}
                onChange={this.bookChange.bind(this, 'image')}
              />
            </Col>
            <Col md={6}>
              <Input
                radius
                amSize="sm"
                type="text"
                label="豆瓣详情"
                defaultValue={this.state.book.alt}
                onChange={this.bookChange.bind(this, 'alt')}
              />
            </Col>
            <Col md={12}>
              <Input
                radius
                amSize="sm"
                type="textarea"
                label="书籍简介"
                defaultValue={this.state.book.summary}
                onChange={this.bookChange.bind(this, 'summary')}
              />
              <Button
                radius
                block
                amStyle="primary"
                className="am-cf am-margin-top"
                onClick={this.setBook.bind(this)}
              >
                确定
              </Button>
            </Col>
          </Col>
        </Grid>
      );
    }
    return (
      <div>
        <Table compact hover>
          <thead>
            <tr>
              <th>标题</th>
              <th>ISBN</th>
              <th>作者</th>
              <th>出版社</th>
              <th>价格</th>
              <th>库存</th>
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
                </Button>
              }
              addonAfter={`共${Math.ceil(this.state.count / 10)}页`}
              onChange={this.pageChange.bind(this)}
              value={this.state.goPage}
            />
          </Col>
        </Grid>
      </div>
    );
  }

  renderItems() {
    return this.state.books.map((book) => {
      if (this.state.status === 'existence') {
        return (
          <tr>
            <td>{book.title}</td>
            <td>{book.isbn}</td>
            <td>{book.author}</td>
            <td>{book.publisher}</td>
            <td>{book.price}</td>
            <td>{book.totalNum}</td>
            <td>
              <ButtonToolbar>
                <Button
                  radius
                  amStyle="primary"
                  amSize="xs"
                  onClick={this.showBook.bind(this, book)}
                >
                  查看
                </Button>
                <Button
                  radius
                  amStyle="success"
                  amSize="xs"
                  onClick={this.showForm.bind(this, book, 'update')}
                >
                  修改
                </Button>
                <Button
                  radius
                  amStyle="danger"
                  amSize="xs"
                  onClick={this.changeStatus.bind(this, 'delete', book.id)}
                >
                  删除
                </Button>
              </ButtonToolbar>
            </td>
          </tr>
        );
      }
      if (this.state.status === 'inexistence') {
        return (
          <tr>
            <td>{book.title}</td>
            <td>{book.isbn}</td>
            <td>{book.author}</td>
            <td>{book.publisher}</td>
            <td>{book.price}</td>
            <td>{book.totalNum}</td>
            <td>
              <ButtonToolbar>
                <Button
                  radius
                  amStyle="primary"
                  amSize="xs"
                  onClick={this.showBook.bind(this, book)}
                >
                  查看
                </Button>
                <Button
                  radius
                  amStyle="success"
                  amSize="xs"
                  onClick={this.changeStatus.bind(this, 'recovery', book.id)}
                >
                  恢复
                </Button>
              </ButtonToolbar>
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
                amStyle={this.state.btnExistence}
                onClick={this.showPanel.bind(this, 'existence', {
                  btnExistence: 'primary',
                  btnInexistence: 'default',
                })}
              >
                在库页
              </Button>
              <Button
                radius
                amStyle={this.state.btnInexistence}
                onClick={this.showPanel.bind(this, 'inexistence', {
                  btnExistence: 'default',
                  btnInexistence: 'primary',
                })}
              >
                删除页
              </Button>
            </ButtonGroup>
          </Col>
          <Col md={3} mdOffset={1}>
            <ButtonToolbar>
              <Button
                radius
                amStyle="primary"
              >
                <Icon icon="file" /> 批量导入
              </Button>
              <Button
                radius
                amStyle="primary"
                onClick={this.showForm.bind(this, {}, 'manual')}
              >
                <Icon icon="plus" /> 添加
              </Button>
            </ButtonToolbar>
          </Col>
          <Col md={4}>
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
        {this.renderFrom()}
        <ModalTrigger
          modal={this.state.modal}
          show={this.state.isModalOpen}
          onClose={this.closeModal.bind(this)}
        />
      </Container>
    );
  }
}

export default Books;
