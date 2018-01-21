//personal.js
function getUserInfo(pageObj) {
    wx.getUserInfo({
        success: function(res) {
            var userInfo = res.userInfo
            var nickName = userInfo.nickName
            var avatarUrl = userInfo.avatarUrl
            pageObj.setData({
                userInfo: {
                    nickName: res.userInfo.nickName,
                    avatar: res.userInfo.avatarUrl
                }
            })
        },
        fail: function() {
            console.log('fail');
        }
    })
}

function getPersonalSongs(pageObj) {
    let personalSongs = wx.getStorageSync('personalSongs') || [];
    pageObj.setData({
        personalSongs: personalSongs
    })
}

function uncollect(pageObj, song, callback) {
    let personalSongs = wx.getStorageSync('personalSongs') || [];
    let index = findIndex(personalSongs, song);
    personalSongs.splice(index, 1);
    wx.setStorageSync('personalSongs', personalSongs);
    pageObj.setData({
        personalSongs: wx.getStorageSync('personalSongs')
    })
    callback();
}

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.songid === song.songid
    })
}



module.exports = {
    getUserInfo: getUserInfo,
    getPersonalSongs: getPersonalSongs,
    uncollect: uncollect
}