import compact from 'lodash.compact';
import values from 'lodash.values';
import pick from 'lodash.pick';
import React from 'react';
import { Container, NavBar, Button, List, Field, Icon, View } from 'amazeui-touch';
import { Link } from 'react-router';
import Tloader from 'react-touch-loader';

export default class Existences extends React.Component {
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
      keyWord: '',
      books: []
    };
  }

  getBooks(page) {
    return fetch(`/api/books/bookList?status=existence&page=${page}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  componentWillMount() {
    return this.getBooks(1).then((books) => {
      let hasMore;
      if (books.length < 10) {
        hasMore = 0
      } else {
        hasMore = 1
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
    return fetch(`/api/books/search?keyWord=${this.state.keyWord}&status=existence&page=${page}`, {
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
      this.getBooks(1).then((books) => {
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
        loadPromise = this.getBooks(this.state.page + 1);
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

  renderItems() {
    return this.state.books.map((book, index) => {
      const info = compact(values(pick(book, [
        'subtitle', 'origin_title', 'author', 'translator', 'publisher', 'pubdate', 'isbn' , 'price'
      ]))).join(' / ');
      return (
        <List.Item
          title={book.title}
          subTitle={<p className="text-normal">{info}</p>}
          after={`库存：${book.totalNum}`}
          linkComponent={Link}
          linkProps={ { to: { pathname: `/books/${book.id}` } } }
          {...book}
          key={index}
        />
      );
    });
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title="查看书库"
        />
        <Field
          placeholder="输入书名或ISBN..."
          onChange={this.keyWordChange.bind(this)}
          btnAfter={
            <Button
              amStyle="primary"
              onClick={this.handleSearch.bind(this)}
            >
              <Icon name="search" />
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
      </View>
    );
  }
}
