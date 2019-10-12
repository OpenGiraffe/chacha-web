import React, { Component } from 'react';
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '@/components/Menu';
import './OrgLinkmans.less';
import { immutableRenderDecorator } from 'react-immutable-render-mixin';
import { connect } from 'react-redux';
import fetch from '../../../../../utils/fetch';

class EbookOrgList extends Component {
    async getEbookOrgByPid(pid0) {
        console.log('pid', pid0);
        // 设置通讯录单位
        const [ebErr, ebRes] = await fetch('loadEbookOrgByPid', {});
        if (!ebErr) {
            console.log('通讯录单位数据:%o', ebRes);
            return ebRes;
        }
        console.log('加载通讯录单位出错啦', ebErr);
        return ebErr;
    }

    render() {
        const { item, index } = this.props;
        console.log('item: %o, %d, pid:%s', item, index, item.get('id'));
        // console.log('ebookOrg: %o', ebookOrg);

        const jsonOBJ = this.getEbookOrgByPid(item.get('id'));
        console.log('jsonOBJ', jsonOBJ);
        // const name = item.get('name');
        return (
            <div>jsonOBJ</div>
        );
    }
}
// export default connect(state => ({
//     ebookOrg: state.getIn(['ebook', '_root', 'bookOrg']),
// }))(EbookOrgList);
export default EbookOrgList;

