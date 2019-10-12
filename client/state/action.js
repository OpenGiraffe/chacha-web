import fetch from 'utils/fetch';
import convertRobot10Message from 'utils/convertRobot10Message';
import store from './store';

// const getFriendId = require('utils/getFriendId');

const { dispatch } = store;

/* ===== 用户 ===== */
async function setUser(user) {
    user.groups.forEach((group) => {
        Object.assign(group, {
            type: 'group',
            unread: 0,
            messages: [],
            members: [],
        });
    });
    user.friends.forEach((friend) => {
        Object.assign(friend, {
            type: 'friend',
            // _id: getFriendId(friend.from, friend.to._id),// 此句不知啥意思
            _id: friend._id,
            messages: [],
            unread: 0,
            avatar: friend.avatar,
            name: friend.name,
            to: friend._id,
        });
    });
    const linkmans = [...user.groups, ...user.friends];// ...为展开运算符 会自动遍历展开user.groups列表中的内容
    const { _id, avatar, username, isAdmin } = user;
    // console.log('SetUser:', user);
    dispatch({
        type: 'SetUser',
        user: {
            _id,
            avatar,
            username,
            linkmans,
            isAdmin,
        },
    });

    connect();

    const linkmanIds = [
        ...user.groups.map(g => g._id),
        ...user.friends.map(f => f._id),
    ];
    const [err, messages] = await fetch('getLinkmansLastMessages', { linkmans: linkmanIds });
    for (const key in messages) {
        messages[key].forEach(m => convertRobot10Message(m));
    }
    console.log('getLinkmansLastMessages:', messages);
    if (!err) {
        dispatch({
            type: 'SetLinkmanMessages',
            messages,
        });
    }
}
async function setGuest(defaultGroup) {
    defaultGroup.messages.forEach(m => convertRobot10Message(m));
    dispatch({
        type: 'SetDeepValue',
        keys: ['user'],
        value: { linkmans: [
            Object.assign(defaultGroup, {
                type: 'group',
                unread: 0,
                members: [],
            }),
        ] },
    });
}
function connect() {
    dispatch({
        type: 'SetDeepValue',
        keys: ['connect'],
        value: true,
    });
}
function disconnect() {
    dispatch({
        type: 'SetDeepValue',
        keys: ['connect'],
        value: false,
    });
}
function logout() {
    dispatch({
        type: 'Logout',
    });
}
function setAvatar(avatar) {
    dispatch({
        type: 'SetAvatar',
        avatar,
    });
}
function setUserName(username) {
    dispatch({
        type: 'SetUserName',
        username,
    });
}
function addLinkmanMessage(linkmanId, message) {
    dispatch({
        type: 'AddLinkmanMessage',
        linkmanId,
        message,
    });
}
function addLinkmanMessages(linkmanId, messages) {
    messages.forEach(m => convertRobot10Message(m));
    dispatch({
        type: 'AddLinkmanMessages',
        linkmanId,
        messages,
    });
}
function updateSelfMessage(linkmanId, messageId, message) {
    dispatch({
        type: 'UpdateSelfMessage',
        linkmanId,
        messageId,
        message,
    });
}
/**
 * 删除自己的临时消息
 * @param {String} linkmanId 联系人id
 * @param {String} messageId 临时消息id
 */
function deleteSelfMessage(linkmanId, messageId) {
    dispatch({
        type: 'DeleteSelfMessage',
        linkmanId,
        messageId,
    });
}

/* ===== 联系人 ===== */
function setFocus(linkmanId) {
    dispatch({
        type: 'SetFocus',
        linkmanId,
    });
}
function setGroupMembers(groupId, members) {
    dispatch({
        type: 'SetGroupMembers',
        groupId,
        members,
    });
}
function setGroupAvatar(groupId, avatar) {
    dispatch({
        type: 'SetGroupAvatar',
        groupId,
        avatar,
    });
}
function addLinkman(linkman, focus = false) {
    if (linkman.type === 'group') {
        linkman.members = [];
        linkman.messages = [];
        linkman.unread = 0;
    }
    dispatch({
        type: 'AddLinkman',
        linkman,
        focus,
    });
}
function removeLinkman(linkmanId) {
    dispatch({
        type: 'RemoveLinkman',
        linkmanId,
    });
}
function setFriend(linkmanId, from, to) {
    dispatch({
        type: 'SetFriend',
        linkmanId,
        from,
        to,
    });
}

/** ===== 通讯录 ==== * */
async function setEbook(value) {
    dispatch({
        type: 'SetEbook',
        keys: ['ebook', '_root'],
        value,
    });
    window.localStorage.setItem('ebook', value);
}
async function setEbookOrg(value) {
    // 设置通讯录单位
    const [ebErr, ebRes] = await fetch('loadEbookOrgByPid', {
        pid: value.pid,
    });
    if (!ebErr) {
        console.log('通讯录单位数据:%o', ebRes);
        dispatch({
            type: 'SetEbookOrg',
            keys: ['ebook', '_root', 'bookOrg'],
            value,
        });
    } else {
        console.log('加载通讯录单位出错啦', ebErr);
    }
}

async function setEbookOrgPerson(value) {
    dispatch({
        type: 'setEbookOrgPerson',
        keys: ['ebook', '_root', 'bookOrg', 'orgPerson'],
        value,
    });
}

/* ===== UI ===== */
function showLoginDialog() {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'showLoginDialog'],
        value: true,
    });
}
function closeLoginDialog() {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'showLoginDialog'],
        value: false,
    });
}
function setPrimaryColor(color) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'primaryColor'],
        value: color,
    });
    window.localStorage.setItem('primaryColor', color);
}
function setPrimaryTextColor(color) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'primaryTextColor'],
        value: color,
    });
    window.localStorage.setItem('primaryTextColor', color);
}
function setBackgroundImage(image) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'backgroundImage'],
        value: image,
    });
    window.localStorage.setItem('backgroundImage', image);
}
function setSound(sound) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'sound'],
        value: sound,
    });
    window.localStorage.setItem('sound', sound);
}
function setSoundSwitch(value) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'soundSwitch'],
        value,
    });
    window.localStorage.setItem('soundSwitch', value);
}
function setNotificationSwitch(value) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'notificationSwitch'],
        value,
    });
    window.localStorage.setItem('notificationSwitch', value);
}
function setVoiceSwitch(value) {
    dispatch({
        type: 'SetDeepValue',
        keys: ['ui', 'voiceSwitch'],
        value,
    });
    window.localStorage.setItem('voiceSwitch', value);
}

function changePanel(panelName) {
    dispatch({
        type: 'ChangePanel',
        panelName,
    });
    window.localStorage.setItem('panelName', panelName);
}

function setVideoPlaying(value) {
    dispatch({
        type: 'SetVideoPlaying',
        keys: ['video', 'setVideoPlaying'],
        value,
    });
    window.localStorage.setItem('setVideoPlaying', value);
}

export default {
    setVideoPlaying,
    setUser,
    setGuest,
    connect,
    disconnect,
    logout,
    setAvatar,
    setUserName,

    setFocus,
    setGroupMembers,
    setGroupAvatar,
    addLinkman,
    removeLinkman,
    setFriend,

    addLinkmanMessage,
    addLinkmanMessages,
    updateSelfMessage,
    deleteSelfMessage,

    showLoginDialog,
    closeLoginDialog,
    setPrimaryColor,
    setPrimaryTextColor,
    setBackgroundImage,
    setSound,
    setSoundSwitch,
    setNotificationSwitch,
    setVoiceSwitch,
    changePanel,
    setEbook,
    setEbookOrg,
    setEbookOrgPerson,
};
