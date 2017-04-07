import lodash from 'lodash';
import React from 'react';
import { Container, NavBar, Modal, Group, Grid, Col, Accordion, Button, Field, Icon, View } from 'amazeui-touch';
import { Link } from 'react-router';

export default class Recommend extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      isModalOpen: false,
      modalContext: '',
      keyWord: '',
      isRecommend: false,
      book: []
    };
  }

  getBook() {
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
    if (this.props.location.query.recommend === 'true') {
      return this.getBook().then((book) => this.setState({ book, isRecommend: true }))
    }
  }

  searchBook() {
    return fetch(`/api/books/requestBook?isbn=${this.state.keyWord}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  handleSearch() {
    this.searchBook().then((book) => {
      if (!_.isUndefined(book.msg)) {
        this.setState({
          isModalOpen: true,
          modalContext: '请输入正确的isbn'
        });
      } else {
        this.setState({
          isRecommend: true,
          book
        });
      }
    });
  }

  keyWordChange() {
    this.setState({ keyWord: event.target.value });
  }

  recommendBook() {
    let book = Object.keys(this.state.book).map(key => `${key}=${this.state.book[key]}&`).toString().replace(/,/g, '');
    book = book.slice(0, book.length - 1);
    console.log(book)
    return fetch(`/api/books/recommend`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `${book}`,
      credentials: 'include'
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'recommend success') {
        this.setState({
          isModalOpen: true,
          modalContext: '图书已推荐。'
        });
      } else {
        this.setState({
          isModalOpen: true,
          modalContext: '操作失败'
        });
      }
    });
  }

  renderRecommend() {
    if (_.isEmpty(this.state.book)) {
      return (<Button hollow block disable>推荐</Button>);
    }
    return (
      <Button
        hollow
        block
        amStyle="primary"
        onClick={this.recommendBook.bind(this)}
      >
        推荐
      </Button>
    );
  }

  renderDetail() {
    if (!_.isEmpty(this.state.book)) {
      return (
        <Group noPadded className="margin-v-0">
          <Group className="margin-v-0 padding">
            <Grid collapse wrap="wrap">
              <Col cols={6}>
                <h3>{this.state.book.title}</h3>
              </Col>
              <Col cols={4}>
                <p className="text-normal">
                  豆瓣评分：{this.state.book.averageRating}（{this.state.book.numRaters}人评分）<br />
                  ISBN：{this.state.book.isbn}<br />
                  副标题：{this.state.book.subtitle}<br />
                  原标题：{this.state.book.origin_title}<br />
                  作者：{this.state.book.author}<br />
                  翻译：{this.state.book.translator}<br />
                  出版社：{this.state.book.publisher}<br />
                  出版日期：{this.state.book.pubdate}<br />
                  价格：{this.state.book.price}
                </p>
              </Col>
              <Col cols={2}>
                <img width="115" src={this.state.book.image} />
              </Col>
            </Grid>
          </Group>
          <Group className="margin-v-0 padding">
            <Button
              block
              hollow
              amStyle="primary"
              href={this.state.book.alt}
            >
              豆瓣详情
            </Button>
          </Group>
          <Group noPadded className="margin-v-0">
            <Accordion
              className="margin-v-0"
              defaultActiveKey={1}>
              <Accordion.Item
                title={`${this.state.book.title}的内容简介`}
              >
                {this.state.book.summary}
              </Accordion.Item>
            </Accordion>
          </Group>
        </Group>
      );
    }
    return (
      <Group className="margin-v-0">
        <p className="text-center">无结果</p>
      </Group>
    );
  }

  render() {
    return (
      <View>
        <NavBar
          amStyle="primary"
          title="图书推荐"
        />
        <Field
          placeholder="输入ISBN..."
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
        <Group className="margin-v-0">
          <Button
            block
            hollow
            amStyle="primary"
            href='/#/scan?action=recommend'
          >
            扫描条形码
          </Button>
          {this.renderRecommend()}
        </Group>
        <Container scrollable>
          {this.renderDetail()}
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
