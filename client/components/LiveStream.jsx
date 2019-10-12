import React, { Component } from 'react';
import PropTypes from 'prop-types';
import flvjs from 'flv.js';
import Button from '@/components/Button';
import CuTime from '@/components/CuTime';
import socket from '@/socket';

class LiveStream extends Component {
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        /**
         * media URL, can be starts with 'https(s)' or 'ws(s)' (WebSocket)
         */
        url: PropTypes.string,
        /**
         * media type, 'flv' or 'mp4'
         */
        type: PropTypes.oneOf(['flv', 'mp4']).isRequired,
        /**
         * whether the data source is a **live stream**
         */
        isLive: PropTypes.bool,
        /**
         * whether to enable CORS for http fetching
         */
        cors: PropTypes.bool,
        /**
         * whether to do http fetching with cookies
         */
        withCredentials: PropTypes.bool,
        /**
         * whether the stream has audio track
         */
        hasAudio: PropTypes.bool,
        /**
         * whether the stream has video track
         */
        hasVideo: PropTypes.bool,
        /**
         * total media duration, in milliseconds
         */
        duration: PropTypes.bool,
        /**
         * total file size of media file, in bytes
         */
        filesize: PropTypes.number,
        /**
         * Optional field for multipart playback, see MediaSegment
         */
        segments: PropTypes.arrayOf(PropTypes.shape({
            /**
             * indicates segment duration in milliseconds
             */
            duration: PropTypes.number.isRequired,
            /**
             * indicates segment file size in bytes
             */
            filesize: PropTypes.number,
            /**
             * indicates segment file URL
             */
            url: PropTypes.string.isRequired,
        })),
        /**
         * @see https://github.com/Bilibili/flv.js/blob/master/docs/api.md#config
         */
        config: PropTypes.object,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            videoControlStyle: '',
            isFillVideo: this.props.autoFill,
        };
    }

    initFlv = ($video) => {
        console.log('init video ', $video, this.props.url);
        if ($video) {
            if (flvjs.isSupported()) {
                const p = { ...this.props };
                if (this.nextProps && this.props.url !== this.nextProps.url) {
                    p.url = this.nextProps.url;
                    console.log(`new url: ${p.url}`);
                }
                const flvPlayer = flvjs.createPlayer(p, this.props.config);
                flvPlayer.attachMediaElement($video);
                flvPlayer.load();

                this.flvPlayer = flvPlayer;
            }

            if (this.flvPlayer) {
                const _this_player = this.flvPlayer;
                $video.addEventListener('progress', function () {
                    // console.log(_this_player);
                    if (_this_player) {
                        const bf = _this_player.buffered;
                        const range = 0;
                        // console.log("buffered.length:"+_this_player.buffered.length+"");
                        if (bf.length != 0 && this.buffered.end(range) - this.currentTime > 1.5) {
                            this.currentTime = this.buffered.end(range);
                            console.log(`seekTo: ${this.currentTime} range:${range}`);
                        }
                        // console.log("currentTime:"+_this_player.currentTime+" :bf.start(range)="+bf.start(range));
                    }
                });
            }

            if (this.flvPlayer) {
                this.flvPlayer.on(flvjs.Events.ERROR, () => {
                    console.log('ERROR..');
                });
                this.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
                    console.log('LOADING_COMPLETE..');
                });
                this.flvPlayer.on(flvjs.Events.METADATA_ARRIVED, () => {
                    console.log('METADATA_ARRIVED..');
                });
            }
            this.video = $video;
        }
    }

    componentWillUnmount() {
        if (this.flvPlayer) {
            this.flvPlayer.unload();
            this.flvPlayer.detachMediaElement();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.url !== this.props.url) {
            if (nextProps.url && this.video) {
                if (this.video) {
                    this.video.removeEventListener('progress', () => {});
                }
                if (this.flvPlayer) {
                    this.flvPlayer.unload();
                    this.flvPlayer.detachMediaElement();
                }
                this.nextProps = nextProps;
                this.initFlv(this.video);
            }
        }
    }

    renderLogBox($logbox) {
        if (this.flvPlayer) {
            this.flvPlayer.LoggingControl.addLogListener((type, str) => {
                $logbox.value = `${$logbox.value + str}\n`;
                $logbox.scrollTop = $logbox.scrollHeight;
            });
        }
    }

    handleVideoMouseEnter = (_this) => {
        // console.log('target:', _this.target);
        // _this.target.children(1).className = 'showElement videoControl';
        this.setState({
            videoControlStyle: 'showElement',
        });
    }

    handleVideoMouseLeave = (_this) => {
        // console.log('target:', _this.target);
        // _this.target.children(1).className = 'hideElement videoControl';
        this.setState({
            videoControlStyle: 'hideElement',
        });
    }
    handleFillVideo = (_this) => {
        const blockName = 'autoFill';
        const value = !this.state.isFillVideo === true ? 1 : 0;

        socket.emit('updateSceneBlock', { blockName, value, id: this.videoID }, (res) => {
            if (typeof res === 'string') {
                Message.success(res);
            } else {
                Message.success('保存成功');
            }
        });

        this.setState({
            isFillVideo: !this.state.isFillVideo,
        });
    }

    render() {
        const { className, style, videoName, autoPlay, autoFill, poster, videoID, controls } = this.props;
        let { videoControlStyle, isFillVideo } = this.state;
        if (videoControlStyle == null || videoControlStyle == undefined) {
            videoControlStyle = '';
        }
        const fillStyle = isFillVideo ? 'fill' : 'contain';
        const fillName = !isFillVideo ? '拉伸' : '恢复';
        this.videoID = videoID;
        return (
            <div
                className="videoLiveStream"
                onMouseEnter={this.handleVideoMouseEnter}
                onMouseLeave={this.handleVideoMouseLeave}
            >
                <video
                    name={videoID}
                    autoPlay={autoPlay}
                    controls={controls}
                    className={className}
                    poster={poster}
                    style={Object.assign({
                        width: '100%',
                        'object-fit': fillStyle,
                    }, style)}
                    ref={this.initFlv}
                >
                    Your browser is too old which doesn't support HTML5 video.
                </video>
                <div className="videoInfo"><p>{videoName}</p></div>
                <div className={`${videoControlStyle} videoControl`}>
                    <div className="timeline"><CuTime /></div>
                    <div className="pull-right">
                        <Button color="primary" onClick={this.handleFillVideo}>{fillName}</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default LiveStream;
