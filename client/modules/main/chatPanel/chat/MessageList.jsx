import React, { Component } from 'react';
import { connect } from 'react-redux';
import immutable from 'immutable';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import fetch from 'utils/fetch';
import action from '@/state/action';
import Message from './Message';

function noop() {}

class MessageList extends Component {
    static propTypes = {
        self: PropTypes.string,
        messages: ImmutablePropTypes.list,
        focus: PropTypes.string,
        showUserInfoDialog: PropTypes.func,
    }
    constructor(...args) {
        super(...args);
        this.isFetching = false;
    }
    handleScroll = async (e) => {
        // Don't know why the code-view dialog will also trigger when scrolling
        if (e.target !== this.$list) {
            return;
        }
        if (this.isFetching) {
            return;
        }

        const { focus, messages, self } = this.props;
        const $div = e.target;
        if ($div.scrollTop === 0 && $div.scrollHeight > $div.clientHeight) {
            this.isFetching = true;
            let err = null;
            let result = null;
            if (self) {
                [err, result] = await fetch('getLinkmanHistoryMessages', { linkmanId: focus, existCount: messages.size });
            } else {
                [err, result] = await fetch('getDefalutGroupHistoryMessages', { existCount: messages.size });
            }
            if (!err) {
                action.addLinkmanMessages(focus, result);
            }
            this.isFetching = false;
        }
    }
    renderMessage(message) {
        const { self } = this.props;
        const props = {
            key: message.get('_id'),
            avatar: message.getIn(['from', 'avatar']),
            nickname: message.getIn(['from', 'username']),
            time: new Date(message.get('createTime')),
            type: message.get('type'),
            content: message.get('content'),
            isSelf: self === message.getIn(['from', '_id']),
            tag: message.getIn(['from', 'tag']),
            messageId: message.get('_id'),
            openUserInfoDialog: noop,
            shouldScroll: typeof (this.$list) === 'undefined' ? false : (this.$list.scrollHeight === this.$list.clientHeight || this.$list.scrollTop === 0 || this.$list.scrollTop > this.$list.scrollHeight - this.$list.clientHeight * 2),
        };
        if (props.type === 'image' || props.type === 'file' || props.type === 'video' || props.type === 'audio') {
            props.loading = message.get('loading');
            props.percent = message.get('percent');
            props.filename = message.get('filename');
            props.filesize = message.get('filesize');
            props.duration = message.get('duration');
            props.width = message.get('width');
            props.height = message.get('height');
        }
        if (!props.isSelf && self) {
            props.openUserInfoDialog = this.props.showUserInfoDialog.bind(this, message.get('from').toJS());
        }
        return (
            <Message {...props} />
        );
    }
    render() {
        const { messages } = this.props;
        // console.log('MessageList render', messages);
        // ref={i => this.$list = i} 这是一个回调函数, 在dom渲染时会执行, 相当于
        // function (i){
        //    this.$list = i;
        // }
        return (
            <div className="chat-messageList" onScroll={this.handleScroll} ref={i => this.$list = i}>
                {
                    messages.map(message => (
                        this.renderMessage(message)
                    ))
                }
            </div>
        );
    }
}

export default connect((state) => {
    const isLogin = !!state.getIn(['user', '_id']);
    let messages = immutable.List();
    if (!isLogin) {
        const defaultGroupMessages = state.getIn(['user', 'linkmans', 0, 'messages']);
        return {
            self: '',
            messages: defaultGroupMessages || messages,
        };
    }

    const self = state.getIn(['user', '_id']);
    const focus = state.get('focus');
    const linkman = state.getIn(['user', 'linkmans']).find(g => g.get('_id') === focus);
    if (linkman) {
        messages = linkman.get('messages');
    }

    return {
        self,
        focus,
        messages,
    };
})(MessageList);
