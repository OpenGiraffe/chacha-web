import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '@/components/Menu';
import SearchBar from './SearchBar';
import './OrgLinkmans.less';
import { immutableRenderDecorator } from 'react-immutable-render-mixin';
import EbookOrgList from './EbookOrgList';
import action from '@/state/action';
import fetch from '../../../../../utils/fetch';
import EbookTree from './EbookTree';


@immutableRenderDecorator
class EbookList extends Component {
    static propTypes = {
        isLogin: PropTypes.bool.isRequired,
        ebook: PropTypes.object,
    }

    onTitleClick = (eventKey, domEvent) => {
        console.log('eventKey', eventKey, domEvent);
        // action.setEbookOrg(eventKey);
    }
    onTitleMouseLeave = (eventKey, domEvent) => {
        domEvent.preventDefault();// 阻止默认行为
    }
    renderEbookOrgList(item, index) {
        // const jsonOBJ = this.getEbookOrgByPid(item.pid);
        // for (const obj of jsonOBJ) {
        //     console.log('obj:', obj);
        // }
        return (
            <SubMenu
                key={item.get('id')}
                title={item.get('name')}
                onTitleClick={this.onTitleClick}
                onTitleMouseLeave={this.onTitleMouseLeave}
                onMouseEnter={this.onTitleMouseLeave}
                onTitleMouseEnter={this.onTitleMouseLeave}
            >
                <EbookOrgList item={item} index={index} />
            </SubMenu>
        );
    }
    render() {
        const { isLogin, ebook } = this.props;
        console.log('ebook', ebook);
        return (

            <div className="module-main-feature">
                { isLogin ? <SearchBar /> : null}
                <div style={{ border: '0px' }}>
                    <Menu
                        onClick={this.onClick}
                        mode="inline"
                        ref={i => this.$list = i}
                    >
                        {
                            ebook.map((item, index) => (
                                this.renderEbookOrgList(item, index)
                            ))
                        }
                    </Menu>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    isLogin: !!state.getIn(['user', '_id']),
    ebook: state.getIn(['ebook', '_root']),
}))(EbookList);
