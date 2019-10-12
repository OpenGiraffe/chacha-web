import React, { Component } from 'react';
import platform from 'platform';

import socket from '@/socket';
import action from '@/state/action';
import { Tabs, TabPane, TabContent, ScrollableInkTabBar } from '@/components/Tabs';
import Input from '@/components/Input';
import Message from '@/components/Message';
import './Login.less';
import encodeRSA from 'utils/encodeRSA';

class Login extends Component {
    constructor(...args) {
        super(...args);
    }

    handleLogin = () => {
        socket.emit('login', {
            username: encodeRSA(this.loginUsername.getValue()),
            password: encodeRSA(this.loginPassword.getValue()),
            os: platform.os.family,
            browser: platform.name,
            environment: platform.description,
        }, (res) => {
            console.log('login', res);
            if (typeof res === 'string') {
                Message.error(res);
            } else {
                action.setUser(res);// 设置联系人数据
                action.closeLoginDialog();
                window.localStorage.setItem('token', res.token);
            }
        });
    }
    handleRegister = () => {
        socket.emit('register', {
            username: encodeRSA(this.registerUsername.getValue()),
            password: encodeRSA(this.registerPassword.getValue()),
            os: platform.os.family,
            browser: platform.name,
            environment: platform.description,
        }, (res) => {
            if (typeof res === 'string') {
                Message.error(res);
            } else {
                Message.success('创建成功');
                action.setUser(res);
                action.closeLoginDialog();
                window.localStorage.setItem('token', res.token);
            }
        });
    }
    renderLogin() {
        return (
            <div className="pane">
                <h3>用户名</h3>
                <Input ref={i => this.loginUsername = i} onEnter={this.handleLogin} />
                <h3>密码</h3>
                <Input type="password" ref={i => this.loginPassword = i} onEnter={this.handleLogin} />
                <button onClick={this.handleLogin}>登录</button>
            </div>
        );
    }
    renderRegister() {
        return (
            <div className="pane">
                <h3>用户名</h3>
                <Input ref={i => this.registerUsername = i} onEnter={this.handleRegister} placeholder="用户名用于登录, 请慎重" />
                <h3>密码</h3>
                <Input type="password" ref={i => this.registerPassword = i} onEnter={this.handleRegister} placeholder="暂时也不支持修改" />
                <button onClick={this.handleRegister}>注册</button>
            </div>
        );
    }
    render() {
        return (
            <Tabs
                className="main-login"
                defaultActiveKey="login"
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent />}
            >
                <TabPane tab="登录" key="login">
                    {this.renderLogin()}
                </TabPane>
                <TabPane tab="注册" key="register">
                    {this.renderRegister()}
                </TabPane>
            </Tabs>
        );
    }
}

export default Login;
