import React, { Component } from 'react';

import './VideotapePanel.less';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import VideoFeature from './VideoFeature';
import LiveStream from '../../../components/LiveStream';
import MButton from '@/components/Button';
import Dialog from '@/components/Dialog';
import booleanStateDecorator from '../../../../utils/booleanStateDecorator';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import fetch from '../../../../utils/fetch';
import Input from '@/components/Input';
import socket from '@/socket';
import action from '@/state/action';

@booleanStateDecorator({
    settingChannelDialog: false,
    saveSceneDialog: false,
    set1videoPage: false,
    set4videoPage: true,
    set9videoPage: false,
    set16videoPage: false,
    setFullvideoPage: false,
    winColor: false,
})

class VideoViewer extends Component {
    static propTypes = {
        focus: PropTypes.string,
        videos: ImmutablePropTypes.list,
    }

    componentDidMount() {
        this.watchFullScreen();
        this.four(this);
    }

    fullScreen = () => {
        console.log('fullscreen:', this.state.isFullScreen);
        if (!this.state.isFullScreen) {
            this.requestFullScreen();
        } else {
            this.exitFullscreen();
        }
    };

    // 进入全屏
    requestFullScreen = () => {
        console.log('requestFullScreen');
        const de = document.documentElement;
        if (de.requestFullscreen) {
            de.requestFullscreen();
        } else if (de.mozRequestFullScreen) {
            de.mozRequestFullScreen();
        } else if (de.webkitRequestFullScreen) {
            de.webkitRequestFullScreen();
        }
    };

    // 退出全屏
    exitFullscreen = () => {
        console.log('exitFullscreen');
        const de = document;
        if (de.exitFullscreen) {
            de.exitFullscreen();
        } else if (de.mozCancelFullScreen) {
            de.mozCancelFullScreen();
        } else if (de.webkitCancelFullScreen) {
            de.webkitCancelFullScreen();
        }
    };

    one = async (a) => {
        console.log(1, a);
        const [err, result] = await fetch('queryNVideo', { split: 1 });
        this.setState({
            videos: result,
            split: 1,
            set1videoPage: true,
            set4videoPage: false,
            set9videoPage: false,
            set16videoPage: false,
            setFullvideoPage: false,
        });
    }
    four = async (a) => {
        console.log(4, a);
        const [err, result] = await fetch('queryNVideo', { split: 4 });
        this.setState({
            videos: result,
            split: 4,
            set1videoPage: false,
            set4videoPage: true,
            set9videoPage: false,
            set16videoPage: false,
            setFullvideoPage: false,
        });
    }
    nine = async (a) => {
        console.log(9, a);
        const [err, result] = await fetch('queryNVideo', { split: 9 });
        this.setState({
            videos: result,
            split: 9,
            set1videoPage: false,
            set4videoPage: false,
            set9videoPage: true,
            set16videoPage: false,
            setFullvideoPage: false,
        });
    }
    sixt = async (a) => {
        console.log(16, a);
        const [err, result] = await fetch('queryNVideo', { split: 16 });
        this.setState({
            videos: result,
            split: 16,
            set1videoPage: false,
            set4videoPage: false,
            set9videoPage: false,
            set16videoPage: true,
            setFullvideoPage: false,
        });
    }
    full = (a) => {
        console.log('full', a);
        this.fullScreen();
    }

    save = (a) => {
        this.setState({
            saveSceneDialog: true,
        });
    }

    handleClick = (_this) => {
        console.log('click...', _this);
        this.setState({
            winKey: _this.key,
        });
    }
    handleSaveSence = () => {
        const name = this.sceneName.getValue();
        socket.emit('saveNewScene', { name }, (res) => {
            if (typeof res === 'string') {
                Message.error(res);
            } else {
                this.sceneName.clear();
                this.toggleSaveSceneDialog();
                Message.success('保存成功');
            }
        });
    }

    renderNVideo(n_video) {
        const { videoPlaying } = this.props;
        const { videos, winKey } = this.state;
        if (videoPlaying && videos) {
            Object.keys(videos).forEach((key) => {
                if (videos[key].key === winKey) {
                    videos[key] = videoPlaying;
                }
            });
        }
        return (
            <div className="row col-sm-9">
                {!videos ? '' : videos.map(result => (
                    <div
                        className={`col-md-3 window1 video-window-${n_video}`}
                        alt={result.key}
                        onClick={this.handleClick.bind(this, result)}
                    >
                        {!result.hasSignal ? this.renderNoSignal(result) : this.renderLiveStream(result)}
                    </div>
                ))}
            </div>
        );
    }

    renderNoSignal(lvs) {
        // console.log('renderNoSignal:',style,this.state.winColor);
        return (
            <div className="video-nosignal">
                <div className="pull-right">
                    <MButton color="primary" onClick={this.toggleSettingChannelDialog}>选择通道</MButton>
                </div>
                <div className="pull-middle">无信号</div>
            </div>
        );
    }

    renderLiveStream(lvs) {
        console.log('lvs:', lvs);
        return (
            <LiveStream
                videoID={lvs.id}
                videoName={lvs.name}
                className="video-screenmain"
                url={lvs.url}
                type="flv"
                style={{ width: '100%' }}
                isLive
                autoPlay={lvs.autoPlay}
                autoFill={lvs.autoFill}
                hasVideo={lvs.hasVideo}
                hasAudio={lvs.hasAudio}
                controls={lvs.controls}
                config={{
                    enableWorker: false,
                    lazyLoadMaxDuration: 5,
                    accurateSeek: true,
                    seekType: 'range',
                    enableStashBuffer: false,
                    stashInitialSize: 128,
                    lazyLoad: false,
                    autoCleanupSourceBuffer: true,
                }}
            />
        );
    }

    renderFullVideo() {

    }

    // 监听fullscreenchange事件
    watchFullScreen = () => {
        const _self = this;
        document.addEventListener(
            'webkitfullscreenchange',
            () => {
                _self.setState({
                    isFullScreen: document.webkitIsFullScreen,
                });
            },
            false,
        );
    };


    render() {
        const { settingChannelDialog, saveSceneDialog, set1videoPage, set4videoPage, set9videoPage, set16videoPage, setFullvideoPage } = this.state;
        return (
            <div>
                <div className="video-screengroup">
                    <Grid container spacing={1} direction="column" alignItems="center"><Grid item>
                        <ButtonGroup size="small" aria-label="Small outlined button group">
                            <Button onClick={this.one}>单屏</Button>
                            <Button onClick={this.four}>4分屏</Button>
                            <Button onClick={this.nine}>9分屏</Button>
                            <Button onClick={this.sixt}>16分屏</Button>
                            <Button onClick={this.full}>全屏</Button>
                            <Button onClick={this.save}>保存场景</Button>
                        </ButtonGroup>
                    </Grid>
                    </Grid>
                </div>
                <Dialog
                    className="dialog"
                    visible={settingChannelDialog}
                    title="选择通道"
                    onClose={this.toggleSettingChannelDialog}
                >
                    <VideoFeature />
                </Dialog>
                <Dialog
                    className="save-dialog"
                    visible={saveSceneDialog}
                    title="另存为"
                    onClose={this.toggleSaveSceneDialog}
                >
                    <div className="content">
                        <h3>新场景名称</h3>
                        <Input ref={i => this.sceneName = i} />
                        <button onClick={this.handleSaveSence}>保存</button>
                    </div>
                </Dialog>
                {set1videoPage ? this.renderNVideo(1) : set4videoPage ? this.renderNVideo(4) : set9videoPage ? this.renderNVideo(9) : set16videoPage ? this.renderNVideo(16) : setFullvideoPage ? this.renderFullVideo() : this.render4Video()}
            </div>
        );
    }
}

export default connect(state => ({
    videos: state.get('videos'),
    videoPlaying: state.getIn(['video', 'setVideoPlaying']),
}))(VideoViewer);
