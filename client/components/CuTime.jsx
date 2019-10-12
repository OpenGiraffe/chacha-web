import React from 'react';
import Time from 'react-time';
import './components.less';

class CuTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = { nowTime: new Date() };
        // setInterval(()=>{
        //     this.setState({
        //         nowTime: new Date(),
        //     })
        // },1000)
    }
    render() {
        const { nowTime } = this.state;
        return (
            <div>
                <p style={{ color: '#fff' }}><Time value={nowTime} format="YYYY-MM-DD HH:mm:ss" /></p>
            </div>
        );
    }
}
export default CuTime;

