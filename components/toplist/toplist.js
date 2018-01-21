//toplist.js
function getToplist(pageObj) {
    wx.request({
        url: 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1503141330275',
        success: ((res) => {
            pageObj.setData({
                request: {
                    Recommend: pageObj.data.request.Recommend,
                    Toplist: true,
                    Search: pageObj.data.request.Search
                },
                topList: res.data.data.topList
            })
            // console.log(e.data.topList);
        })
    })
}

function goTopDetail(e, pageObj) {
    let id = e.currentTarget.dataset.id;
    pageObj.setData({
        lastShowIndex: pageObj.data.showIndex,
        showIndex: 4,
        detailLoading: false
    })
    getSonglist(pageObj, id);
    // console.log(e.currentTarget.dataset.id);
}

function getSonglist(pageObj, id) {
    wx.request({
        url: `https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&tpl=3&page=detail&type=top&topid=${id}&_=1503369956465`,
        success: ((res) => {
            pageObj.setData({
                detailLoading: true,
                songList: formatData(res.data)
            })
        })
    })
}

function formatData(data) {
    let songList = {};
    songList.listname = data.topinfo.ListName;
    songList.bgImage = data.topinfo.pic_album;
    let songs = [];
    for (let i = 0; i < data.songlist.length; i++) {
        songs[i] = createSong(data.songlist[i].data);
    }
    songList.songs = songs;
    return songList;
}

function createSong(songItem) {
    let song = {
        songid: songItem.songid,
        songmid: songItem.songmid,
        songname: songItem.songname,
        singername: filterSinger(songItem.singer),
        album: songItem.albumname,
        songImg: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songItem.albummid}.jpg?max_age=2592000`,
        url: `http://100.100.1.10:8081/C400${songItem.songmid}.m4a`,
        collectFlag: false
    }
    return song;
}

function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join(' / ')
}

module.exports = {
    getToplist: getToplist,
    goTopDetail: goTopDetail
}