/* eslint-disable import/first */
if (
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    && navigator.serviceWorker
) {
    window.addEventListener('load', () => {
        const sw = process.env.NODE_ENV === 'development' ? '/static/fiora-sw.js' : '/fiora-sw.js';
        navigator.serviceWorker.register(sw);
    });
}

import 'babel-polyfill';

import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import platform from 'platform';

import fetch from 'utils/fetch';
import App from './App';
import store from './state/store';
import action from './state/action';
import socket from './socket';
import notification from '../utils/notification';
import sound from '../utils/sound';
import getFriendId from '../utils/getFriendId';
// import convertRobot10Message from '../utils/convertRobot10Message';
import voice from '../utils/voice';
import Message from '@/components/Message';

if (window.Notification && (window.Notification.permission === 'default' || window.Notification.permission === 'denied')) {
    window.Notification.requestPermission();
}

let windowStatus = 'focus';
window.onfocus = () => windowStatus = 'focus';
window.onblur = () => windowStatus = 'blur';


async function guest() {
    const [err, res] = await fetch('guest', {
        os: platform.os.family,
        browser: platform.name,
        environment: platform.description,
    });
    console.log('guest res:', res);
    if (!err) {
        action.setGuest(res);
    }
}
socket.on('connect_error', async () => {
    Message.error('服务连接中断，请检查网络是否正常!!');
    window.localStorage.removeItem('rsaPublicKey');
});

socket.on('connect', async () => {
    let rsaPublicKey = window.localStorage.getItem('rsaPublicKey');
    console.log('rsaPublicKey:', rsaPublicKey);
    if (!rsaPublicKey) {
        const [err, res] = await fetch('getNoneRsaPublicKey', {
            os: platform.os.family,
            browser: platform.name,
            environment: platform.description,
        }, { toast: false });
        if (!err && res.errorCode === 1000) {
            rsaPublicKey = res.errorMsg;
            window.localStorage.setItem('rsaPublicKey', rsaPublicKey);
        }
    }
    const dfsUploadURL = window.localStorage.getItem('dfsUploadURL');
    if (!dfsUploadURL) {
        const [err, res] = await fetch('getDFSUploadURL', {
            os: platform.os.family,
            browser: platform.name,
            environment: platform.description,
        }, { toast: false });
        if (!err && res.errorCode === 1000) {
            window.localStorage.setItem('dfsUploadURL', res.errorMsg);
        }
    }
    const dfsDownloadURL = window.localStorage.getItem('dfsDownloadURL');
    if (!dfsDownloadURL) {
        const [err, res] = await fetch('getDFSDownloadURL', {
            os: platform.os.family,
            browser: platform.name,
            environment: platform.description,
        }, { toast: false });
        if (!err && res.errorCode === 1000) {
            window.localStorage.setItem('dfsDownloadURL', res.errorMsg);
        }
    }
    // console.log('dfsUploadURL: %s, dfsDownloadURL: %s', dfsUploadURL,dfsDownloadURL);
    const token = window.localStorage.getItem('token');
    console.log('token:', token);
    if (token) {
        const [err, res] = await fetch('loginByToken', {
            token,
            os: platform.os.family,
            browser: platform.name,
            environment: platform.description,
        }, { toast: false });
        if (err) {
            guest();
        } else {
            console.log('token:%s, res: %o', token, res);

            action.setUser(res);

            // 设置通讯录
            const [ebErr, ebRes] = await fetch('loadEbookByUserId', {
                userId: res._id,
            });
            if (!ebErr) {
                console.log('通讯录数据:%o', ebRes);
                action.setEbook(ebRes);
            } else {
                console.log('加载通讯录出错啦', ebErr);
            }
        }
    } else {
        guest();
    }
});
socket.on('disconnect', () => {
    action.disconnect();
    Message.info('连接断开');
});

let prevFrom = '';
socket.on('message', (message) => {
    // robot10
    // convertRobot10Message(message);
    const state = store.getState();
    const isSelfMessage = message.from._id === state.getIn(['user', '_id']);
    const linkman = state.getIn(['user', 'linkmans']).find(l => l.get('_id') === message.to);
    let title = '';
    if (linkman) {
        action.addLinkmanMessage(message.to, message);
        if (linkman.get('type') === 'group') {
            title = `${message.from.username} 在 ${linkman.get('name')} 对大家说:`;
        } else {
            title = `${message.from.username} 对你说:`;
        }
    } else {
        // 联系人不存在并且是自己发的消息, 不创建新联系人
        if (isSelfMessage) {
            return;
        }
        const newLinkman = {
            _id: getFriendId(
                state.getIn(['user', '_id']),
                message.from._id,
            ),
            type: 'temporary',
            createTime: Date.now(),
            avatar: message.from.avatar,
            name: message.from.username,
            messages: [],
            unread: 1,
        };
        action.addLinkman(newLinkman);
        title = `${message.from.username} 对你说:`;

        fetch('getLinkmanHistoryMessages', { linkmanId: newLinkman._id }).then(([err, res]) => {
            if (!err) {
                action.addLinkmanMessages(newLinkman._id, res);
            }
        });
    }

    if (isSelfMessage) {
        return;
    }

    if (windowStatus === 'blur' && state.getIn(['ui', 'notificationSwitch'])) {
        notification(
            title,
            message.from.avatar,
            message.type === 'text' ? message.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>') : `[${message.type}]`,
            Math.random(),
        );
    }

    if (state.getIn(['ui', 'soundSwitch'])) {
        const soundType = state.getIn(['ui', 'sound']);
        sound(soundType);
    }

    if (message.type === 'text' && state.getIn(['ui', 'voiceSwitch'])) {
        const text = message.content
            .replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g, '')
            .replace(/#/g, '');

        if (text.length > 100) {
            return;
        }

        const from = linkman && linkman.get('type') === 'group' ?
            `${message.from.username}在${linkman.get('name')}说`
            :
            `${message.from.username}对你说`;
        if (text) {
            voice.push(from !== prevFrom ? from + text : text, message.from.username);
        }
        prevFrom = from;
    }
});

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app'),
);
