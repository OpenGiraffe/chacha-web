import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Viewer from 'react-viewer';
import Prism from 'prismjs';
import 'react-viewer/dist/index.css';

import Avatar from '@/components/Avatar';
import { Circle, Line } from '@/components/Progress';
import Dialog from '@/components/Dialog';
import MessageBox from '@/components/Message';
import Time from 'utils/time';
import expressions from 'utils/expressions';
import fetch from 'utils/fetch';
import action from '../../../../state/action';
import TooltipMenu from '@/components/TooltipMenu';
import VideoPlayer from '@/components/VideoPlayer';
import AudioPlayer from '@/components/AudioPlayer';


require('../../../../assets/fonts/iconfont.js');

const transparentImage = 'data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw==';
const languagesMap = {
    javascript: 'javascript',
    typescript: 'typescript',
    java: 'java',
    c_cpp: 'cpp',
    python: 'python',
    ruby: 'ruby',
    php: 'php',
    golang: 'go',
    csharp: 'csharp',
    html: 'html',
    css: 'css',
    markdown: 'markdown',
    sql: 'sql',
    json: 'json',
};
const styles = {
    display: 'table-cell',
    height: '60px',
    width: '80px',
    textAlign: 'center',
    background: '#f6f6f6',
    verticalAlign: 'middle',
    border: '5px solid white',
};

const anime_play = {
    animation: 'demo 2s steps(4) infinite',
};

const anime_stop = {
    animation: '',
};

class Message extends Component {
    static formatTime(time) {
        const nowTime = new Date();
        if (Time.isToday(nowTime, time)) {
            return Time.getHourMinute(time);
        }
        if (Time.isYesterday(nowTime, time)) {
            return `昨天 ${Time.getHourMinute(time)}`;
        }
        return `${Time.getMonthDate(time)} ${Time.getHourMinute(time)}`;
    }

    static convertExpression(txt) {
        return txt.replace(
            /#\(([\u4e00-\u9fa5a-z]+)\)/g,
            (r, e) => {
                const index = expressions.default.indexOf(e);
                if (index !== -1) {
                    return `<img class="expression-baidu" src="${transparentImage}" style="background-position: left ${-30 * index}px;" onerror="this.style.display='none'" alt="${r}">`;
                }
                return r;
            },
        );
    }

    static propTypes = {
        avatar: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        time: PropTypes.object.isRequired,
        type: PropTypes.oneOf(['text', 'image', 'url', 'code', 'invite', 'file', 'audio', 'video']),
        content: PropTypes.string.isRequired,
        isSelf: PropTypes.bool,
        loading: PropTypes.bool,
        percent: PropTypes.number,
        openUserInfoDialog: PropTypes.func,
        shouldScroll: PropTypes.bool,
        tag: PropTypes.string,
    };
    static defaultProps = {
        isSelf: false,
    };

    constructor(props) {
        super(props);
        this.state = {};
        if (props.type === 'code') {
            this.state.showCode = false;
        } else if (props.type === 'iamge') {
            this.state.showImage = false;
        } else if (props.type === 'audio') {
            this.state.showAudio = false;
        }
    }

    componentDidMount() {
        const { type, content, shouldScroll, isSelf } = this.props;
        if (type === 'image') {
            let maxWidth = this.dom.clientWidth - 100;
            const maxHeight = 400;
            if (maxWidth > 500) {
                maxWidth = 500;
            }

            const $image = this.dom.querySelector('.img');
            const parseResult = /width=([0-9]+)&height=([0-9]+)/.exec(content);
            if (parseResult) {
                const [, width, height] = parseResult;
                let scale = 1;
                if (width * scale > maxWidth) {
                    scale = maxWidth / width;
                }
                if (height * scale > maxHeight) {
                    scale = maxHeight / height;
                }
                $image.width = width * scale;
                $image.height = height * scale;
                $image.src = /^(blob|data):/.test(content) ? content.split('?')[0] : `${content}&imageView2/3/w/${Math.floor($image.width * 1.2)}/h/${Math.floor($image.height * 1.2)}`;
            }
        }
        // else if (type === 'file') {
        //
        // }
        if (shouldScroll || isSelf) {
            this.dom.scrollIntoView();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !(
            this.props.avatar === nextProps.avatar &&
            this.props.loading === nextProps.loading &&
            this.props.percent === nextProps.percent &&
            this.state.showCode === nextState.showCode &&
            this.state.showImage === nextState.showImage &&
            this.state.showAudio === nextState.showAudio
        );
    }

    showCode = () => {
        this.setState({
            showCode: true,
        });
    };
    hideCode = () => {
        this.setState({
            showCode: false,
        });
    };
    showImageViewer = () => {
        this.setState({
            showImage: true,
        });
    };
    hideImageViewer = () => {
        this.setState({
            showImage: false,
        });
    };
    handleClickAvatar = () => {
        const { isSelf, openUserInfoDialog } = this.props;
        if (!isSelf) {
            openUserInfoDialog();
        }
    };
    joinGroup = async () => {
        const inviteInfo = JSON.parse(this.props.content);

        const [err, res] = await fetch('joinGroup', { groupId: inviteInfo.groupId });
        if (!err) {
            res.type = 'group';
            action.addLinkman(res, true);
            MessageBox.success('加入群组成功');
            const [err2, messages] = await fetch('getLinkmanHistoryMessages', { linkmanId: res._id, existCount: 0 });
            if (!err2) {
                action.addLinkmanMessages(res._id, messages);
            }
        }
    };

    renderText() {
        let { content } = this.props;
        content = content.replace(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
            r => (
                `<a href="${r}" rel="noopener noreferrer" target="_blank">${r}</a>`
            ),
        );
        return (
            <div className="text" dangerouslySetInnerHTML={{ __html: Message.convertExpression(content) }} />
        );
    }

    renderImage() {
        const { content, loading, percent } = this.props;
        let src = content;
        if (src.startsWith('blob')) {
            [src] = src.split('?');
        }
        console.log('renderImageloading :', loading);
        // 设置高度宽度为1防止被原图撑起来
        return (
            <div className={`image ${loading ? 'loading' : ''} ${/huaji=true/.test(content) ? 'huaji' : ''}`}>
                <img className="img" src={transparentImage} width="1" height="1" onDoubleClick={this.showImageViewer} />
                <Circle className="progress" percent={percent} strokeWidth="5" strokeColor="#1E90FF" trailWidth="5" />
                <div className="progress-number">{Math.ceil(percent)}%</div>
                <Viewer
                    visible={this.state.showImage}
                    onClose={this.hideImageViewer}
                    onMaskClick={this.hideImageViewer}
                    images={[{ src, alt: src }]}
                    noNavbar
                />
            </div>
        );
    }

    renderCode() {
        const { content } = this.props;
        const parseResult = /@language=([_a-z]+)@/.exec(content);
        if (!parseResult) {
            return (
                <pre className="code">不支持的编程语言</pre>
            );
        }

        const language = languagesMap[parseResult[1]];
        const transferContent = content;
        const rawCode = transferContent.replace(/@language=[_a-z]+@/, '');
        const html = Prism.highlight(rawCode, Prism.languages[language]);
        setTimeout(Prism.highlightAll.bind(Prism), 0); // https://github.com/PrismJS/prism/issues/1487
        let size = `${rawCode.length}B`;
        if (rawCode.length > 1024) {
            size = `${Math.ceil(rawCode.length / 1024 * 100) / 100}KB`;
        }
        return (
            <div className="code">
                <div className="button" onClick={this.showCode}>
                    <div>
                        <div className="icon">
                            <i className="iconfont icon-code" />
                        </div>
                        <div className="code-info">
                            <span>{language}</span>
                            <span>{size}</span>
                        </div>
                    </div>
                    <p>查看</p>
                </div>
                <Dialog className="code-viewer" title="查看代码" visible={this.state.showCode} onClose={this.hideCode}>
                    <pre className="pre line-numbers">
                        <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: html }} />
                    </pre>
                </Dialog>
            </div>
        );
    }

    renderUrl() {
        const { content } = this.props;
        return (
            <a href={content} target="_black" rel="noopener noreferrer">{content}</a>
        );
    }

    renderInvite() {
        const inviteInfo = JSON.parse(this.props.content);
        return (
            <div className="invite" onClick={this.joinGroup}>
                <div>
                    <span>&quot;{inviteInfo.inviter}&quot; 邀请你加入群组「{inviteInfo.groupName}」</span>
                </div>
                <p>加入</p>
            </div>
        );
    }

    renderVideo() {
        const { fileType, content, loading, percent, width, height } = this.props;
        console.log('renderVideo....', content, loading, percent, width, height);
        let src = content;
        if (src.startsWith('blob')) {
            [src] = src.split('?');
        }
        const thumbnail = src.replace('/dfs/web/', '/dfs/thumbnail/');
        const newWidth = width > 300 ? 300 : width;
        const newHeight = height / width * newWidth;
        return (
            <div className="msgVideoBox" style={{ width: newWidth, height: newHeight }}>
                <VideoPlayer
                    style={{ width: newWidth, height: newHeight }}
                    loop
                    muted
                    controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
                    poster={thumbnail || ''}
                    onCanPlayThrough={() => {
                        // Do stuff
                    }}
                >
                    <source src={src} type={fileType || 'video/mp4'} />
                    {/* <track label="English" kind="subtitles" srcLang="en" src="http://source.vtt" default /> */}
                </VideoPlayer>
                <div className={`loading-line ${loading ? 'loading' : 'progress-flow-hide'} `}>
                    <Line className="progress" percent={percent} strokeWidth="1" strokeColor="#1E90FF" trailWidth="1" />
                    <div className="progress-number">{Math.ceil(percent)}%</div>
                </div>
            </div>
        );
    }


    renderAudio() {
        const { fileType, content, poster, loading, percent, filesize, duration, messageId, unread } = this.props;
        const { showAudio, audioPos } = this.state;
        let props = {
            showAudio,
            audioPos,
        };
        props = Object.assign(props, this.props);

        console.log('renderAudio....', content, loading, percent, filesize, duration, messageId, showAudio);
        return (
            <div className="msgAudioBox">
                <AudioPlayer {...props} />
            </div>
        );
    }

    renderFile() {
        const { content, loading, percent, filename, filesize } = this.props;
        console.log('renderFileloading :', loading);
        return (
            <div className="msgFileBox">
                <div className="file_info">
                    <svg className="svgicon_left" aria-hidden="true">
                        <use xlinkHref="#icon-file_zip" />
                    </svg>
                    <div className="file_sta"><i className="iconfont icon-gou" style={{ color: '#32CD32' }} /></div>
                    <div className="file_name">
                        <span>{filename}</span>
                        <span className="file_grey">({filesize ? (filesize / 1024 / 1024).toFixed(2) : 0.1}MB)</span>
                    </div>
                    <div className="file_desc">
                        <span className="file_grey">已发送的文件，暂存100天</span>
                    </div>

                </div>
                <div className={`split_line ${loading ? 'loading' : 'split_line_blue'} `} />
                <div className={`${loading ? 'progress-flow' : 'progress-flow-hide'} `}>
                    <Line className="progress" percent={percent} strokeWidth="1" strokeColor="#1E90FF" trailWidth="1" />
                    <div className="progress-number">{Math.ceil(percent)}% {loading}</div>
                </div>
                <div className={`${loading ? 'file_handle' : 'file_handle file_handle-normal'} `}>
                    <span><a>下载</a></span>
                    <span><a>另存为</a></span>
                    <span><a>转发</a></span>
                    <span style={{ float: 'right' }}>
                        <TooltipMenu placement="right" mouseEnterDelay={0.3} overlay={this.renderFileHandleMenu}>
                            <div>
                                <span><a><i className="iconfont icon-lvzhou_gengduo_xiangqing detail" /></a></span>
                            </div>
                        </TooltipMenu>

                    </span>
                </div>

                { /* <Line className="progress" percent={percent} strokeWidth="5" strokeColor="#a0c672" trailWidth="5" /> */}
            </div>

        );
    }

    renderFileHandleMenu() {
        return (
            <ul className="ul_nonedot">
                <li>
                    <a tabIndex="-1" href="#">存到微云</a>
                </li>
                <li>
                    <a tabIndex="-1" href="#">撤回</a>
                </li>
                <li>
                    <a tabIndex="-1" href="#">打开文件助手</a>
                </li>
            </ul>

        );
    }

    renderLoc() {
        return (
            <div>位置</div>
        );
    }

    renderContent() {
        const { type } = this.props;
        console.log('renderContent:', type);
        switch (type) {
        case 'text': {
            return this.renderText();
        }
        case 'image': {
            return this.renderImage();
        }
        case 'code': {
            return this.renderCode();
        }
        case 'url': {
            return this.renderUrl();
        }
        case 'invite': {
            return this.renderInvite();
        }
        case 'video': {
            return this.renderVideo();
        }
        case 'audio': {
            return this.renderAudio();
        }
        case 'file': {
            return this.renderFile();
        }
        case 'loc': {
            return this.renderLoc();
        }
        default:
            return (
                <div className="unknown">不支持的消息类型</div>
            );
        }
    }

    render() {
        const {
            avatar, nickname, time, type, isSelf, tag,
        } = this.props;
        return (
            <div className={`chat-message ${isSelf ? 'self' : ''} ${type}`} ref={i => this.dom = i}>
                <Avatar className="avatar" src={avatar} size={44} onClick={this.handleClickAvatar} />
                <div className="right">
                    <div className="nickname-time">
                        <span className="tag" style={{ display: tag ? 'inline-block' : 'none' }}>{tag}</span>
                        <span className="nickname">{nickname}</span>
                        <span className="time">{Message.formatTime(time)}</span>
                    </div>
                    <div className="content">{this.renderContent()}</div>
                    <div className="arrow" />
                </div>
            </div>
        );
    }
}

export default Message;
