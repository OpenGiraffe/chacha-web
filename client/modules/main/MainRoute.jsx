import React, { Component } from 'react';
import { connect } from 'react-redux';

import ChatPanel from './chatPanel/ChatPanel';
import AddrBookPanel from './addrBookPanel/AddrBookPanel';
import VideotapePanel from './videotapePanel/VideotapePanel';

class MainRoute extends Component {
    static defaultProps = {
        panelName: 'ChatPanel', // 默认显示面板
    }

    constructor(props) {
        super(props);
        this.props = {};
        this.state = { panelName: 'ChatPanel' };
    }

    render() {
        const panelName = this.props.panelName;
        let panel = null;
        console.log('panelName:', panelName, this.state);
        if (panelName === 'ChatPanel') {
            panel = <ChatPanel />;
        } else if (panelName === 'AddrBookPanel') {
            panel = <AddrBookPanel />;
        } else if (panelName === 'VideotapePanel') {
            panel = <VideotapePanel />;
        }

        return (
            panel
        );
    }
}

// 如何根据state显示不同的面板?
export default connect(state => ({
    panelName: state.get('panelName'),
}))(MainRoute);
