import React, { Component } from 'react';

import './AddrBookPanel.less';
import EbookList from './addrBookSidebar/EbookList';
import { connect } from 'react-redux';

class AddrBookPanel extends Component {
    render() {
        return (
            <div className="module-main-addrBookPanel">
                <span>通讯录，开发中...</span>
            </div>
        );
    }
}

export default connect(state => ({
    myRole: state.getIn(['user', '_role']),
}))(AddrBookPanel);
