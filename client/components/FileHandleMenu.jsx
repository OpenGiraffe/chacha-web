
import React from 'react';
import PropTypes from 'prop-types';
import './components.less';

class FileHandleMenu extends React.Component {
    constructor(props) {
        super(props),
        this.state = {
            modalIsOpen: 'none',
            atUserItems: false,
        };

        this.contentBtn = this.contentBtn.bind(this),
        this.programBtn = this.programBtn.bind(this),
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.userCenter = this.userCenter.bind(this);
        this.handleMouseUserOver = this.handleMouseUserOver.bind(this);
    }

    contentBtn() {
        this.context.router.history.push('/details');
    }

    programBtn() {
        this.context.router.history.push('/gui');
    }

    handleMouseOver(e) {
        this.setState({
            modalIsOpen: 'block',
        });
    }

    handleMouseOut() {
        this.setState({
            modalIsOpen: 'none',
        });
    }
    handleMouseUserOver(e) {
        this.setState({
            modalIsOpen: 'block',
        });
    }

    userCenter() {
        this.setState({
            modalIsOpen: 'none',
        });
    }

    render() {
        const { username } = this.props;
        return (
            <div className="" >
                <div
                    className=""
                    onMouseOver={this.handleMouseOver}
                    onMouseLeave={this.handleMouseOut}
                >{username}
                </div>

                <div
                    className=""
                    style={{ display: this.state.modalIsOpen }}
                    onMouseOver={this.handleMouseUserOver}
                    onMouseLeave={this.handleMouseOut}
                >
                    <ul className="" >
                        <li className="" >个人中心</li>
                        <li className="" >账号设置</li>
                        <li className="" >注销</li>
                    </ul>
                </div>
            </div>
        );
    }
}

FileHandleMenu.contextTypes = {
    router: PropTypes.object.isRequired,
};

export default FileHandleMenu;
