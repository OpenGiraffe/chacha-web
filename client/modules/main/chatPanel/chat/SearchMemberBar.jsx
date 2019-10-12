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
import GroupInfo from '../GroupInfo';
import UserInfo from '../UserInfo';
import Button from "../../../../components/Button";


@booleanStateDecorator({
    groupInfoDialog: false,
    userInfoDialog: false,
    createGroupDialog: false,
})
class SearchMemberBar extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            showAddButton: true,
            showSearchResult: false,
            searchResultActiveKey: 'recents',
            searchResult: {
                users: [],
                recents: [],
            },
            groupInfo: {},
            userInfo: {},
            members:[],
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
            searchResultActiveKey: 'recents',
            searchResult: {
                users: [],
                recents: [],
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
    handleFocus = async () => {
        this.setState({
            showAddButton: false,
            showSearchResult: true,
        });
        const [searchError, searchResult] = await fetch('searchRecent', {});
        if (!searchError) {
            this.setState({
                searchResult: {
                    users: searchResult.users,
                    recents: searchResult.recents,
                },
                showAddButton: false,
                showSearchResult: true,
            });
        }
    }
    handleCreateGroup = () => {
        const name = this.groupName.getValue();
        socket.emit('createGroup', { name }, (res) => {
            if (typeof res === 'string') {
                Message.error(res);
            } else {
                res.type = 'group';
                action.addLinkman(res, true);
                this.groupName.clear();
                this.toggleCreateGroupDialog();
                Message.success('创建群组成功');
            }
        });
    }
    search = async () => {
        const keywords = this.searchInput.value.trim();
        const [searchError, searchResult] = await fetch('searchRecent', { keywords });
        if (!searchError) {
            this.setState({
                searchResult: {
                    users: searchResult.users,
                    recents: searchResult.recents,
                },
            });
        }
    }
    handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setTimeout(() => {
                this.search();
                this.lastSearchTime = Date.now();
                this.switchTabToUsers();
            }, 0);
        }
    }
    handleActiveKeyChange = (key) => {
        this.setState({
            searchResultActiveKey: key,
        });
    }
    switchTabToUsers = () => {
        this.setState({
            searchResultActiveKey: 'users',
        });
    }
    switchTabToRecents = () => {
        this.setState({
            searchResultActiveKey: 'recents',
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

    addUserToMemberList = (userInfo) => {
        const newMembers = [];
        const count = this.state.members ? this.state.members.length:0;
        for (let i = 0; i < count; i++) {
            newMembers.push(this.state.members[i]);
        }
        newMembers.push(userInfo);
        this.setState({
            members: newMembers
        })
    }

    renderSearchUsers(count = 999) {
        const { users } = this.state.searchResult;
        count = Math.min(count, users.length);

        const usersDom = [];
        for (let i = 0; i < count; i++) {
            usersDom.push((
                <div key={users[i]._id} onClick={this.openUserInfoDialog.bind(this, users[i])}>
                    <Avatar size={40} src={users[i].avatar} />
                    <p>{users[i].username}</p>
                </div>
            ));
        }
        return usersDom;
    }

    renderSearchRecents(count = 999) {
        const { recents } = this.state.searchResult;
        count = Math.min(count, recents.length);
        console.log('recents:',recents)
        const recentsDom = [];
        for (let i = 0; i < count; i++) {
            recentsDom.push((
                <div key={recents[i]._id} onClick={this.addUserToMemberList.bind(this, recents[i])}>
                    <Avatar size={40} src={recents[i].avatar} />
                    <p>{recents[i].username}</p>
                </div>
            ));
        }
        return recentsDom;
    }


    renderSelectedMembers() {
        console.log('renderSelectedMembers members:',this.state.members)
        return !this.state.members ? '' : this.state.members.map(member => (
            <div key={member._id} style={{"width":"100%"}}>
                <span>
                    <Avatar size={36} src={member.avatar} />
                    <span>{member.username}</span>
                </span>
            </div>
        ));
    }

    handleInvitToGroup = () => {

    }
    render() {
        const {
            showAddButton,
            createGroupDialog,
            searchResult, showSearchResult,
            searchResultActiveKey,
            userInfoDialog,userInfo,
            members,
        } = this.state;
        return (
            <div>
            <div className="chatPanel-feature">
                <input className={showSearchResult ? 'focus' : 'blur'} type="text" placeholder="搜索用户" autoComplete="false" ref={i => this.searchInput = i} onFocus={this.handleFocus} onKeyDown={this.handleInputKeyDown} />
                <i className="iconfont icon-icon_search" />
                <IconButton style={{ display: showAddButton ? 'block' : 'none' }} width={40} height={40} icon="add" iconSize={38} onClick={this.toggleCreateGroupDialog} />
                <Dialog className="create-group-dialog" title="创建群组" visible={createGroupDialog} onClose={this.toggleCreateGroupDialog}>
                    <div className="content">
                        <h3>请输入群组名</h3>
                        <Input ref={i => this.groupName = i} />
                        <button onClick={this.handleCreateGroup}>创建</button>
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

                    <TabPane tab="最近搜索" key="recents">
                        {
                            searchResult.recents.length === 0 ?
                                <p className="none">没有搜索到内容, 换个关键字试试吧~~</p>
                                :
                                <div className="user-list only">{this.renderSearchRecents()}</div>
                        }
                    </TabPane>
                    <TabPane tab="联系人" key="users">
                        {
                            searchResult.users.length === 0 ?
                                <p className="none">没有搜索到内容, 换个关键字试试吧~~</p>
                                :
                                <div className="group-list only">{this.renderSearchUsers()}</div>
                        }
                    </TabPane>
                </Tabs>
                <UserInfo visible={userInfoDialog} userInfo={userInfo} onClose={this.toggleUserInfoDialog} />
            </div>
                <div>
                    <div className="online-members">
                        <p>已选联系人: <span>{ members ? members.length : 0}&nbsp;个</span>&nbsp;<span style={{"float":"right"}}><Button type="waiting" onClick={this.handleInvitToGroup}>确定</Button></span></p>
                        <div>{this.renderSelectedMembers()}</div>
                    </div>
                </div>

            </div>

        );
    }
}

export default SearchMemberBar;
