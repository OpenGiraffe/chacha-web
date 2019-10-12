import React, { Component } from 'react';
import Sound from 'react-sound';
import './components.less';

class AudioPlayer extends Component {
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
    handleSongClick = (obj) => {
        // 你的业务代码
        // use newslistid do something
        soundManager.stopAll();// 停止正在播放的所有音乐
        this.setState({ showAudio: !this.state.showAudio });
    }
    handleSongLoading = (obj) => {
        console.log('handleSongLoading:', obj);
    }
    handleSongPlaying = (obj) => {
        // console.log('handleSongPlaying:', obj.position, obj.duration);
        // this.setState({audioPos: Math.ceil(obj.position)})
    }

    handleSongFinishedPlaying = () => {
        console.log('handleSongFinishedPlaying');
        this.setState({ showAudio: false });
    }
    handleSongStop = (postion, duration) => {
        this.setState({ showAudio: false });
    }
    handleSongError = (obj) => {
        console.log('handleSongError:', obj);
    }

    render() {
        const { fileType, content, poster, loading, percent, filesize, duration, messageId, unread } = this.props;
        const { showAudio, audioPos } = this.state;
        console.log('renderAudio....', content, loading, percent, filesize, duration, messageId, showAudio);
        let src = content;
        if (src.startsWith('blob')) {
            [src] = src.split('?');
        }

        // 宽度最长120px 60秒 最短10px 1秒
        let durationWidth = 0;
        if (duration > 60) durationWidth = 300;
        else if (duration < 2) durationWidth = 60;
        else durationWidth = Math.ceil(60 + (260 / 60) * duration);

        return (
            <div id={messageId} className="speech-message" onClick={this.handleSongClick}>
                <div className="speech-message-content" style={{ width: durationWidth }}>
                    <div className="anime" style={showAudio ? { animation: 'speech-area 2s steps(4) infinite' } : { animation: '' }} />
                    <span className="speech-time" >{duration}"</span>
                </div>
                <Sound
                    url={src}
                    playStatus={showAudio ? Sound.status.PLAYING : Sound.status.STOPPED}
                    playFromPosition={0 /* in milliseconds */}
                    onLoading={this.handleSongLoading}
                    onPlaying={this.handleSongPlaying}
                    onFinishedPlaying={this.handleSongFinishedPlaying}
                    autoLoad={false}
                    onError={this.handleSongError}
                    ignoreMobileRestrictions
                    onStop={this.handleSongStop}
                />
            </div>
        );
    }
}

export default AudioPlayer;
