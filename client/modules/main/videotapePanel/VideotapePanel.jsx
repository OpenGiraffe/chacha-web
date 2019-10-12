import React, { Component } from 'react';

import './VideotapePanel.less';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import Input from '@material-ui/core/Input';
import VideoFeature from './VideoFeature';
import LiveStream from '../../../components/LiveStream';
import MButton from '@/components/Button';
import Dialog from '@/components/Dialog';
import booleanStateDecorator from '../../../../utils/booleanStateDecorator';
import VideoViewer from './VideoViewer';

@booleanStateDecorator({
    settingChannelDialog: false,
})

class VideotapePanel extends Component {
    render() {
        const { settingChannelDialog } = this.state;
        return (
            <div className="module-main-videotapePanel">
                <div className="module-main-feature">
                    <VideoFeature />
                </div>

                <div className="module-main-video">
                    <VideoViewer />
                </div>
            </div>

        );
    }
}

export default connect(state => ({
    videotape: state.getIn(['user', '_role']),
}))(VideotapePanel);
