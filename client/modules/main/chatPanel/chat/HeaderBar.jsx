import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import immutable from 'immutable';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import IconButton from '@/components/IconButton';
import Message from '@/components/Message';
import {Menu, MenuItem, MenuItemGroup, SubMenu} from '@/components/Menu';
import TooltipMenu from "../../../../components/TooltipMenu";
import 'rc-tooltip/assets/bootstrap_white.css';
import Dialog from '@/components/Dialog';
import booleanStateDecorator from "../../../../../utils/booleanStateDecorator";
import Button from "@/components/Button";
import SearchMemberBar from './SearchMemberBar'
@booleanStateDecorator({
    inviteDialog: false,
})

class HeaderBar extends Component {

    static handleShareGroup() {
        Message.success('已复制邀请信息到粘贴板, 去邀请其它人加群吧');
    }

    static propTypes = {
        linkmanType: PropTypes.string,
        linkmanName: PropTypes.string,
        onShowInfo: PropTypes.func,
        isLogin: PropTypes.bool.isRequired,
    }

    handleInvite = () => {
        this.setState({
            inviteDialog: true,
        });
    }

    handleFocus = () => {
        this.setState({
            showAddButton: false,
            showSearchResult: true,
        });
    }

    handleInputKeyDown = () => {

    }

    renderMoreMenu(_this) {
        return (
            <ul className="head_ul_menu">
                <li>
                    <i className='iconfont icon-tianjiayonghu'></i>
                    <a onClick={_this.handleInvite}>邀请入群</a>
                </li>
                <li>
                    <i className='iconfont icon-shezhi'></i>
                    <a tabIndex="-1" href="#">屏蔽群消息</a>
                </li>
                <li>
                    <i className='iconfont icon-shezhi'></i>
                    <a tabIndex="-1" href="#">设置</a>
                </li>
            </ul>

        );
    }

    render() {
        const {linkmanType, linkmanName, onShowInfo, isLogin} = this.props;
        const {inviteDialog} = this.state;
        if (!linkmanName) {
            return <div/>;
        }
        const _this = this;
        return (
            <div className="chat-headerBar">
                <h2>{linkmanName}</h2>
                {
                    isLogin ?
                        <div>
                            <IconButton width={40} height={40} icon="gonggao" iconSize={24} onClick={onShowInfo}
                                        title='公告'/>
                            <IconButton width={40} height={40} icon="image" iconSize={24} onClick={onShowInfo}
                                        title='相册'/>
                            <IconButton width={40} height={40} icon="file" iconSize={24} onClick={onShowInfo}
                                        title='文件'/>

                            {/*
                                linkmanType === 'group' ?
                                    <CopyToClipboard text={`invite::${linkmanName}`}>
                                        <IconButton width={40} height={40} icon="share" iconSize={24} onClick={HeaderBar.handleShareGroup} />
                                    </CopyToClipboard>

                                    :
                                    null
                            */}
                            {/*<IconButton width={40} height={40} icon="Group-" iconSize={24} onClick={onShowInfo} title={'更多'} />*/}
                            <TooltipMenu placement="bottom" mouseEnterDelay={0.3} overlay={this.renderMoreMenu(_this)}
                                         trigger={['click']} overlayClassName='renderMoreMenu'>
                                <div>
                                    <span><a><i className="iconfont icon-Group-"
                                                style={{fontSize: 24, lineHeight: `40px`}}/></a></span>
                                </div>
                            </TooltipMenu>

                        </div>
                        :
                        null

                }
                {
                    <Dialog className="dialog invite" visible={inviteDialog} title={"邀请进群【"+linkmanName+"】"}
                            onClose={this.toggleInviteDialog}>
                        <div className="content">
                            <SearchMemberBar ></SearchMemberBar>
                        </div>
                    </Dialog>
                }

            </div>
        );
    }
}

export default connect((state) => {
    const focus = state.get('focus');
    const linkmans = state.getIn(['user', 'linkmans']) || immutable.fromJS([]);
    const linkman = linkmans.find(l => l.get('_id') === focus);
    return {
        isLogin: !!state.getIn(['user', '_id']),
        linkmanType: linkman && linkman.get('type'),
        linkmanName: linkman && linkman.get('name'),
    };
})(HeaderBar);
