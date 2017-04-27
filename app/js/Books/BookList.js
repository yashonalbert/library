import compact from 'lodash.compact';
import values from 'lodash.values';
import pick from 'lodash.pick';
import React from 'react';
import { Container, NavBar, ButtonGroup, Button, List, Modal, Field, Icon, View } from 'amazeui-touch';
import Tloader from 'react-touch-loader';

export default class BookList extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      page: 1,
      hasMore: 0,
      initializing: 1,
      refreshedAt: Date.now(),
      isSearch: false,
      isModalOpen: false,
      modalContext: '',
      status: 'existence',
      btnExistence: 'primary',
      btnInexistence: 'default',
      keyWord: '',
      books: []
    };
  }

  getBooks(status, page) {
    return fetch(`/api/books/bookList?status=${status}&page=${page}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  showPanel(status, amStyle) {
    return this.getBooks(status, 1).then((books) => {
      return this.setState({
        ...amStyle,
        isSearch: false,
        page: 1,
        status,
        books
      });
    });
  }

  closeMsg() {
    return this.setState({
      isModalOpen: false,
      modalContext: ''
    });
  }

  componentWillMount() {
    return this.getBooks(this.state.status, 1).then((books) => {
      let hasMore;
      if (books.length < 10) {
        hasMore = 0;
      } else {
        hasMore = 1;
      }
      this.setState({
        page: 1,
        hasMore,
        books
      });
    });
  }

  keyWordChange(event) {
    this.setState({ keyWord: event.target.value });
  }

  searchBooks(page) {
    return fetch(`/api/books/search?keyWord=${this.state.keyWord}&status=${this.state.status}&page=${page}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  handleSearch() {
    this.searchBooks(1).then((books) => {
      this.setState({
        page: 1,
        isSearch: true,
        books
      });
    });
  }

  handleRefresh(resolve, reject) {
    setTimeout(() => {
      this.getBooks(this.state.status, 1).then((books) => {
        let hasMore;
        if (books.length < 10) {
          hasMore = 0;
        } else {
          hasMore = 1;
        }
        this.setState({
          page: 1,
          isSearch: false,
          books,
          hasMore,
          refreshedAt: Date.now()
        });
        resolve();
      });
    }, 1000);
  }

  handleLoadMore(resolve){
    setTimeout(() => {
      let loadPromise;
      if (!this.state.isSearch) {
        loadPromise = this.getBooks(this.state.status,this.state.page + 1);
      } else {
        loadPromise = this.searchBooks(this.state.page + 1);
      }
      return loadPromise.then((books) => {
        let hasMore;
        if (books.length < 10) {
          hasMore = 0;
        } else {
          hasMore = 1;
        }
        books = this.state.books.concat(books);
        this.setState({
          page: this.state.page + 1,
          books,
          hasMore
        });
        resolve();
      });
    }, 1000);
  }

  changeStatus(action, bookID) {
    return fetch(`/api/books/${bookID}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `action=${action}`,
      credentials: 'include'
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'change success') {
        const books = _.compact(this.state.books.map((book, index) => {
          if (!book.id === bookID) {
            return book
          }
          return null;
        }));
        this.setState({ books });
      } else if (json.msg === 'lentCount > 0') {
        this.setState({
          isModalOpen: true,
          modalContext: '书籍有借出状态，不可删除。'
        });
      } else {
        this.setState({
          isModalOpen: true,
          modalContext: '操作失败。'
        });
      }
    });
  }


  renderItems() {
    return this.state.books.map((book, index) => {
      const info = compact(values(pick(book, [
        'subtitle', 'origin_title', 'author', 'translator', 'publisher', 'pubdate', 'isbn'
      ]))).join(' / ');
      if (this.state.status === 'existence') {
        return (
          <List.Item
            title={book.title}
            subTitle={<p className="text-normal">{info}</p>}
            after={`库存：${book.totalNum}`}
            desc={
              <ButtonGroup
                hollow
                justify
                amSize="xs"
              >
                <Button
                  className="margin-h"
                  amStyle="success"
                  href={`/#/books/${book.id}?action=update`}
                >
                  查看详情
                </Button>
                <Button
                  className="margin-h"
                  amStyle="alert"
                  onClick={this.changeStatus.bind(this, 'delete', book.id)}
                >
                  删除
                </Button>
              </ButtonGroup>
            }
            {...book}
            key={index}
          />
        )
      }
      if (this.state.status === 'inexistence') {
        return (
          <List.Item
            title={book.title}
            subTitle={<p className="text-normal">{info}</p>}
            after={
              <Button
                hollow
                className="margin-0"
                amSize="xs"
                amStyle="success"
                onClick={this.changeStatus.bind(this, 'recovery', book.id)}
              >
                恢复
              </Button>}
            {...book}
            key={index}
          />
        )
      }
      return null;
    });
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title={
            <ButtonGroup
              amSize="xs"
              className="margin-v"
            >
              <Button
                amStyle={this.state.btnExistence}
                onClick={this.showPanel.bind(this, 'existence', {
                  btnExistence: 'primary',
                  btnInexistence: 'default'
                })}
              >
                在库页
              </Button>
              <Button
                amStyle={this.state.btnInexistence}
                onClick={this.showPanel.bind(this, 'inexistence', {
                  btnExistence: 'default',
                  btnInexistence: 'primary'
                })}
              >
                删除页
              </Button>
            </ButtonGroup>
            }
        />
        <Field
          placeholder="输入书名或ISBN..."
          onChange={this.keyWordChange.bind(this)}
          btnAfter={
            <Button
              amStyle="primary"
              onClick={this.handleSearch.bind(this)}
            >
              <Icon name="search"></Icon>
            </Button>
          }
        />
        <Container scrollable>
          <Tloader
            initializing={this.state.initializing}
            onRefresh={this.handleRefresh.bind(this)}
            hasMore={this.state.hasMore}
            onLoadMore={this.handleLoadMore.bind(this)}
          >
            <List className="margin-v-0">
              {this.renderItems()}
            </List>
          </Tloader>
        </Container>
        <Modal
            role="alert"
            title="松滋公司职工书屋"
            isOpen={this.state.isModalOpen}
            onDismiss={this.closeMsg.bind(this)}
          >
            {this.state.modalContext}
        </Modal>
      </View>
    );
  }
}
