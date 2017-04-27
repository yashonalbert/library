import React from 'react';
import { Container, NavBar, Group, Modal, Grid, Col, Accordion, Button, View } from 'amazeui-touch';
import { Link } from 'react-router';

export default class Detail extends React.Component {
  static defaultProps = {
    transition: 'sfr'
  };

  getInitialState() {
    return {
      isModalOpen: false,
      modalContext: '',
      book: {},
      valid: {}
    };
  }

  getBook() {
    return fetch(`/api/books/${this.props.params.bookID}`, {
      credentials: 'include'
    }).then((res) => res.json());
  }

  getLentValidation(bookID) {
    return fetch(`/api/books/lentValidation/${bookID}`, {
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
    return this.getBook().then((book) => {
      if (book.msg === 'book not found') {
        return this.setState({
          isModalOpen: true,
          modalContext: '书籍不在库存中,可返回主页推荐该书籍。'
        });
      }
      return this.getLentValidation(book.id).then((valid) => {
        return this.setState({ book, valid });
      });
    });
  }

  lentBook(bookID) {
    return fetch(`/api/user/records`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `bookID=${bookID}`,
      credentials: 'include'
    }).then((res) => res.json()).then((json) => {
      if (json.msg === 'submit success') {
        this.setState({
          isModalOpen: true,
          modalContext: '借书申请已提交。'
        });
      } else {
        this.setState({
          isModalOpen: true,
          modalContext: '操作失败。'
        });
      }
    });
  }

  renderNav() {
    if (this.props.location.query.action === 'update') {
      return (
        <NavBar
          amStyle="primary"
          title="书籍详情"
          rightNav={[{
            component: Link,
            title: '修改',
            to: {
              pathname: '/books/set',
              query: {
                action: 'update',
                bookID: this.state.book.id
              }
            }
          }]}
        />
      )
    }
    return (
      <NavBar
        amStyle="primary"
        title="书籍详情"
      />
    )
  }

  lendRender() {
    if (this.props.location.query.action === 'lend') {
      if (this.state.valid.validation) {
        return (<Button hollow block amStyle="primary" onClick={this.lentBook.bind(this, this.state.book.id)}>{`借阅（${this.state.valid.desc}）`}</Button>);
      }
      return (<Button hollow block disable>{`借阅（${this.state.valid.desc}）`}</Button>);
    }
    return null;
  }

  render() {
    return (
      <View>
        {this.renderNav()}
        <Container scrollable>
          <Group className="margin-v-0">
            <Grid collapse wrap="wrap">
              <Col cols={6}>
                <h3>{this.state.book.title}</h3>
              </Col>
              <Col cols={4}>
                <p className="text-normal">
                  豆瓣评分：{this.state.book.averageRating}（{this.state.book.numRaters}人评分）<br/>
                  ISBN：{this.state.book.isbn}<br/>
                  副标题：{this.state.book.subtitle}<br/>
                  原标题：{this.state.book.origin_title}<br/>
                  作者：{this.state.book.author}<br/>
                  翻译：{this.state.book.translator}<br/>
                  出版社：{this.state.book.publisher}<br/>
                  出版日期：{this.state.book.pubdate}<br />
                  价格：{this.state.book.price}
                </p>
              </Col>
              <Col cols={2}>
                <img width="115" src={this.state.book.image}/>
              </Col>
            </Grid>
          </Group>
          <Group className="margin-v-0">
            {this.lendRender()}
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
          <Modal
            role="alert"
            title="松滋公司职工书屋"
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
