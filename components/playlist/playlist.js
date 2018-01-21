//playlist.js
function delFromPlaylist(pageObj, pIndex, callback) {
    let playlist = pageObj.data.playList.playlist.slice(0);
    let song=playlist[pIndex];
    playlist.splice(pIndex,1);
    pageObj.setData({
        playList: {
            isShow: pageObj.data.playList.isShow,
            playlist: playlist
        }
    })
    let actualList=pageObj.data.actualList.slice(0);
    let aIndex=findIndex(actualList,song);
    actualList.splice(aIndex,1);
    if(aIndex<pageObj.data.currentIndex || pageObj.data.currentIndex==pageObj.data.actualList.length-1){
        pageObj.setData({
            currentIndex: pageObj.data.currentIndex-1,
            actualList: actualList
        })
    }
    else {
        pageObj.setData({
            actualList: actualList
        })
    }
    callback();
}
function clearPlaylist(pageObj, callback) {
    wx.showModal({
        title: '提示',
        content: '确定清除所有歌曲？',
        showCancel: true,
        success: function(res) {
            if (res.confirm) {
                pageObj.data.playList.playlist.splice(0,pageObj.data.playList.playlist.length);
                pageObj.data.actualList.splice(0,pageObj.data.actualList.length);
                pageObj.setData({
                    playList: {
                        isShow: false,
                        playlist: []
                    },
                    actualList: [],
                    currentIndex: -1
                })
                callback();
            } else if (res.cancel) {
                return;
            }
        }
    })
}
function tabInPlaylist(pageObj, song, callback){
    let aIndex=findIndex(pageObj.data.actualList,song);
    pageObj.setData({
        currentIndex: aIndex
    })
    callback();
}

function scrollToCurrent(pageObj) {
    let pIndex=findIndex(pageObj.data.playList.playlist,pageObj.data.currentSong);
    let t=pIndex*54;
    pageObj.setData({
        playlistScroll: t
    })
}

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.songid === song.songid
    })
}

module.exports={
	delFromPlaylist: delFromPlaylist,
    clearPlaylist: clearPlaylist,
    tabInPlaylist: tabInPlaylist,
    scrollToCurrent: scrollToCurrent
}