import React from 'react';
import PropTypes from 'prop-types';

import './components.less';


const IconButton = ({ width, height, icon, iconSize, onClick, style,title }) => (
    <div className="component-iconButton" style={Object.assign({ width, height }, style)} onClick={onClick} title={title}>
        <i className={`iconfont icon-${icon}`} style={{ fontSize: iconSize, lineHeight: `${height}px` }} />
    </div>
);
IconButton.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    iconSize: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.object,
};

export default IconButton;
