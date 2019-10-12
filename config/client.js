const MB = 1024 * 1024;
const GB = MB * 1024;
export default {
    server: process.env.NODE_ENV === 'development' ? '//localhost:9300' : '//im.routeyo.net:9300',

    maxImageSize: GB * 4 + 1 * MB,
    maxBackgroundImageSize: MB * 5,
    maxAvatarSize: MB * 1.5,

    // client default system setting
    primaryColor: '74, 144, 226',
    primaryTextColor: '247, 247, 247',
    backgroundImage: require('@/assets/images/background.jpg'),
    sound: 'default',
};
