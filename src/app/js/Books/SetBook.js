import isEmpty from 'lodash.isempty';
import isUndefined from 'lodash.isundefined';
import React from 'react';
import { Container, NavBar, List, Field, Modal, View } from 'amazeui-touch';


export default class SetBook extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      isModalOpen: false,
      modalContext: '',
      book: {}
    };
  }

  getBook() {
    if (this.props.location.query.action === 'manual') {
      return Promise.resolve({});
    } else if (this.props.location.query.action === 'update') {
      return fetch(`/api/books/${this.props.location.query.bookID}`, {
        credentials: 'include'
      }).then((res) => res.json());
    }
    return fetch(`/api/books/requestBook?isbn=${this.props.location.query.isbn}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  closeMsg() {
    return this.setState({
      isModalOpen: false,
      modalContext: ''
    });
  }

  componentWillMount() {
    this.getBook().then((book) => {
      if (!isEmpty(book.msg) && book.msg.indexOf('book_not_found') !== -1) {
        return this.setState({
          isModalOpen: true,
          modalContext: '找不到该书籍，请手动加载。'
        });
      }
      this.setState({ book });
    });
  }

  bookChange(key, event) {
    let book = this.state.book;
    book[key] = event.target.value;
    this.setState({ book });
  }

  defaultTotalNum() {
    if (isUndefined(this.state.book.totalNum)) {
      let book = this.state.book;
      book.totalNum = 1;
      this.setState({ book });
    }
    return this.state.book.totalNum;
  }

  setBook() {
    const book = Object.keys(this.state.book).map(key => `${key}=${this.state.book[key]}&`).toString().replace(/,/g, '');
    return fetch(`/api/books/setBook`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `${book}action=${this.props.location.query.action}`,
      credentials: 'include'
    }).then((res) => res.json()).then((json) => {
      switch (json.msg) {
        case 'set success':
          return this.setState({
            isModalOpen: true,
            modalContext: '提交成功。'
          });
        case 'stock over limit':
          return this.setState({
            isModalOpen: true,
            modalContext: '库存不能低于最小值。'
          });
        default:
          return this.setState({
            isModalOpen: true,
            modalContext: '操作失败。'
          });
      }
    });
  }

  renderNav() {
    if (['auto', 'manual'].includes(this.props.location.query.action)) {
      return (
        <NavBar
          amStyle="primary"
          title="添加书籍"
          rightNav={[{ title: '添加' }]}
          onAction={this.setBook.bind(this)}
        />
      )
    }
    if (this.props.location.query.action === 'update') {
      return (
        <NavBar
          amStyle="primary"
          title="修改书籍"
          rightNav={[{ title: '更新' }]}
          onAction={this.setBook.bind(this)}
        />
      )
    }
    return null;
  }

  render() {
    return (
      <View>
        {this.renderNav()}
        <Container scrollable>
          <List className="margin-v-0">
            <List.Item nested="input">
              <Field
                label="数量"
                onChange={this.bookChange.bind(this, 'totalNum')}
                value={this.defaultTotalNum()}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="标题"
                onChange={this.bookChange.bind(this, 'title')}
                value={this.state.book.title}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="副标题"
                onChange={this.bookChange.bind(this, 'subtitle')}
                value={this.state.book.subtitle}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="原标题"
                onChange={this.bookChange.bind(this, 'origin_title')}
                value={this.state.book.origin_title}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="ISBN"
                onChange={this.bookChange.bind(this, 'isbn')}
                value={this.state.book.isbn} />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="图片"
                onChange={this.bookChange.bind(this, 'image')}
                value={this.state.book.image} />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="作者"
                onChange={this.bookChange.bind(this, 'author')}
                value={this.state.book.author}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="翻译"
                onChange={this.bookChange.bind(this, 'translator')}
                value={this.state.book.translator} />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="出版社"
                onChange={this.bookChange.bind(this, 'publisher')}
                value={this.state.book.publisher}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="出版日期"
                onChange={this.bookChange.bind(this, 'pubdate')}
                value={this.state.book.pubdate}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="价格"
                onChange={this.bookChange.bind(this, 'price')}
                value={this.state.book.price}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="评分人数"
                onChange={this.bookChange.bind(this, 'numRaters')}
                value={this.state.book.numRaters}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="豆瓣评分"
                onChange={this.bookChange.bind(this, 'averageRating')}
                value={this.state.book.averageRating}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                label="豆瓣详情"
                onChange={this.bookChange.bind(this, 'alt')}
                value={this.state.book.alt}
              />
            </List.Item>
            <List.Item nested="input">
              <Field
                type="textarea"
                label="书籍简介"
                onChange={this.bookChange.bind(this, 'summary')}
                value={this.state.book.summary}
              />
            </List.Item>
          </List>
          <Modal
            role="alert"
            title="图书馆"
            isOpen={this.state.isModalOpen}
            onDismiss={this.closeMsg.bind(this)}
          >
            {this.state.modalContext}
          </Modal>
        </Container>
      </View>
    );
  }
}
