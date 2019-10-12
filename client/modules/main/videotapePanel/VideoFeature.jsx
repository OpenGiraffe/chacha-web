import React, { Component } from 'react';

import IconButton from '@/components/IconButton';
import Dialog from '@/components/Dialog';
import Input from '@/components/Input';
import Message from '@/components/Message';
import Avatar from '@/components/Avatar';
import { Tabs, TabPane, TabContent, ScrollableInkTabBar } from '@/components/Tabs';
import socket from '@/socket';
import action from '@/state/action';
import fetch from 'utils/fetch';
import booleanStateDecorator from 'utils/booleanStateDecorator';
import Button from '@/components/Button';


@booleanStateDecorator({
    groupInfoDialog: false,
    userInfoDialog: false,
    createGroupDialog: false,
})
class VideoFeature extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            showAddButton: true,
            showSearchResult: false,
            searchResultActiveKey: 'all',
            searchResult: {
                cams: [],
                gateways: [],
            },
            groupInfo: {},
            userInfo: {},
        };
    }
    componentDidMount() {
        document.body.addEventListener('click', this.handleBodyClick, false);
    }
    componentWillUnmount() {
        document.body.removeEventListener('click', this.handleBodyClick, false);
    }
    resetSearchView = () => {
        this.setState({
            showSearchResult: false,
            showAddButton: true,
            searchResultActiveKey: 'all',
            searchResult: {
                cams: [],
                gateways: [],
            },
        });
        this.searchInput.value = '';
    }
    handleBodyClick = (e) => {
        if (e.target === this.searchInput || !this.state.showSearchResult) {
            return;
        }

        const { currentTarget } = e;
        let { target } = e;
        do {
            if (/search-result/.test(target.className)) {
                return;
            }
            target = target.parentElement;
        } while (target && target !== currentTarget);
        this.resetSearchView();
    }
    handleFocus = () => {
        this.setState({
            showAddButton: false,
            showSearchResult: true,
        });
    }
    handleCreateGroup = () => {
        const name = this.groupName.getValue();
        socket.emit('createGroup', { name }, (res) => {
            if (typeof res === 'string') {
                Message.error(res);
            } else {
                res.type = 'group';
                console.log('res:',res);
                action.addLinkman(res, true);
                this.groupName.clear();
                this.toggleCreateGroupDialog();
                Message.success('创建群组成功');
            }
        });
    }
    searchLastCam = async () => {
        const keywords = this.searchInput.value.trim();
        const [searchError, searchResult] = await fetch('searchLastCam', { keywords });
        if (!searchError) {
            this.setState({
                searchResult: {
                    cams: searchResult.cams,
                    gateways: searchResult.gateways,
                },
            });
        }
    }
    handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setTimeout(() => {
                this.searchLastCam();
                this.lastSearchTime = Date.now();
            }, 0);
        }
    }
    handleInputDBClick = () => {
        setTimeout(() => {
            this.searchLastCam();
            this.lastSearchTime = Date.now();
        }, 0);
    }
    handleActiveKeyChange = (key) => {
        this.setState({
            searchResultActiveKey: key,
        });
    }
    switchTabToUser = () => {
        this.setState({
            searchResultActiveKey: 'user',
        });
    }
    switchTabToGroup = () => {
        this.setState({
            searchResultActiveKey: 'group',
        });
    }
    openGroupInfoDialog = (groupInfo) => {
        this.setState({
            groupInfoDialog: true,
            groupInfo,
        });
        this.resetSearchView();
    }
    openUserInfoDialog = (userInfo) => {
        this.setState({
            userInfoDialog: true,
            userInfo,
        });
        this.resetSearchView();
    }
    setVideoPlaying = (video) => {
        console.log('setVideoPlaying:', video);
        action.setVideoPlaying(video);
    }
    createMarkup = val => ({ __html: val });
    renderSearchUsers(count = 999) {
        const { cams } = this.state.searchResult;
        count = Math.min(count, cams.length);

        const keywords = this.searchInput.value.trim();
        const regx_keywords = new RegExp(keywords, 'g');
        const new_keywords = `<span style="color:#F00">${keywords}</span>`;
        const camsDom = [];
        for (let i = 0; i < count; i++) {
            camsDom.push((
                <div key={cams[i]._id} onClick={this.setVideoPlaying.bind(this, cams[i])}>
                    <Avatar size={40} src={cams[i].avatar} />
                    <p style={{ width: '98%' }} dangerouslySetInnerHTML={this.createMarkup(cams[i].name.replace(regx_keywords, new_keywords))} />
                    <p style={{ flow: 'right' }}><Button>go</Button></p>
                </div>
            ));
        }
        return camsDom;
    }
    renderSearchGroups(count = 999) {
        const { gateways } = this.state.searchResult;
        count = Math.min(count, gateways.length);

        const gatewaysDom = [];
        for (let i = 0; i < count; i++) {
            gatewaysDom.push((
                <div key={gateways[i]._id} onClick={this.openGroupInfoDialog.bind(this, gateways[i])}>
                    <Avatar size={40} src={gateways[i].avatar} />
                    <div>
                        <p>{gateways[i].name}</p>
                        <p>{gateways[i].memberCount}人</p>
                    </div>
                </div>
            ));
        }
        return gatewaysDom;
    }
    render() {
        const {
            showAddButton,
            createGroupDialog,
            searchResult, showSearchResult,
            searchResultActiveKey,
            groupInfoDialog,
            groupInfo,
            userInfoDialog,
            userInfo,
        } = this.state;
        console.log('searchResult:', searchResult);
        return (
            <div className="chatPanel-feature">
                <input className={showSearchResult ? 'focus' : 'blur'} type="text" placeholder="搜索设备/网关" autoComplete="false" ref={i => this.searchInput = i} onFocus={this.handleFocus} onKeyDown={this.handleInputKeyDown} onDoubleClick={this.handleInputDBClick} />
                <i className="iconfont icon-icon_search" />
                <IconButton style={{ display: showAddButton ? 'block' : 'none' }} width={40} height={40} icon="add" iconSize={38} onClick={this.toggleCreateGroupDialog} />
                <Dialog className="create-group-dialog" title="添加设备" visible={createGroupDialog} onClose={this.toggleCreateGroupDialog}>
                    <div className="content">
                        <h3>请输入设备名</h3>
                        <Input ref={i => this.groupName = i} />
                        <h3>请输入设备码</h3>
                        <Input ref={i => this.groupName = i} />
                        <button onClick={this.handleCreateGroup}>确定</button>
                    </div>
                </Dialog>
                <Tabs
                    className="search-result"
                    style={{ display: showSearchResult ? 'block' : 'none' }}
                    activeKey={searchResultActiveKey}
                    onChange={this.handleActiveKeyChange}
                    renderTabBar={() => <ScrollableInkTabBar />}
                    renderTabContent={() => <TabContent />}
                >
                    <TabPane tab="全部" key="all">
                        {
                            searchResult.cams.length === 0 && searchResult.gateways.length === 0 ?
                                <p className="none">没有搜索到内容, 换个关键字试试吧~~</p>
                                :
                                (
                                    <div className="all-list">
                                        <div style={{ display: searchResult.cams.length > 0 ? 'block' : 'none' }}>
                                            <p>设备</p>
                                            <div className="user-list">{this.renderSearchUsers(3)}</div>
                                            <div className="more" style={{ display: searchResult.cams.length > 3 ? 'block' : 'none' }}>
                                                <span onClick={this.switchTabToUser}>查看更多</span>
                                            </div>
                                        </div>
                                        <div style={{ display: searchResult.gateways.length > 0 ? 'block' : 'none' }}>
                                            <p>网关</p>
                                            <div className="group-list">{this.renderSearchGroups(3)}</div>
                                            <div className="more" style={{ display: searchResult.gateways.length > 3 ? 'block' : 'none' }}>
                                                <span onClick={this.switchTabToGroup}>查看更多</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                        }
                    </TabPane>
                    <TabPane tab="设备" key="user">
                        {
                            searchResult.cams.length === 0 ?
                                <p className="none">没有搜索到内容, 换个关键字试试吧~~</p>
                                :
                                <div className="user-list only">{this.renderSearchUsers()}</div>
                        }
                    </TabPane>
                    <TabPane tab="网关" key="group">
                        {
                            searchResult.gateways.length === 0 ?
                                <p className="none">没有搜索到内容, 换个关键字试试吧~~</p>
                                :
                                <div className="group-list only">{this.renderSearchGroups()}</div>
                        }
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default VideoFeature;
