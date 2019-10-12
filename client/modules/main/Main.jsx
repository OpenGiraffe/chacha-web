import React, { Component } from 'react';
import { immutableRenderDecorator } from 'react-immutable-render-mixin';

import Sidebar from './sidebar/Sidebar';

import './Main.less';
import MainRoute from './MainRoute';


@immutableRenderDecorator
class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="module-main">
                <Sidebar />
                <MainRoute />
            </div>
        );
    }
}

export default Main;
