//recommend.js
//获取应用实例
function getRecommend(pageObj) {
    wx.request({
        url: 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1503061472189',
        success: function(res) {
            let recData = formatRecommend(res.data.data);
            pageObj.setData({
                request: {
                    Recommend: true,
                    Toplist: pageObj.data.request.Toplist,
                    Search: pageObj.data.request.Search
                },
                recommend: recData
            });
            // console.log(e.data.recommend);
        }
    })
}

function formatRecommend(data) {
    for (let i = 0; i < data.songList.length; i++) {
        data.songList[i].accessnum = (data.songList[i].accessnum / 10000).toFixed(1);
    }
    return data;
}

function goRecDetail(e, pageObj) {
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
        url: `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?g_tk=5381&uin=0&format=jsonp&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&new_format=1&pic=500&disstid=${id}&type=1&json=1&utf8=1&onlysong=0&nosign=1&_=1503298337777&jsonpCallback=taogeDataCallback`,
        success: ((res) => {
            let songList = res.data.split('taogeDataCallback')[1];
            songList = songList.substring(1, songList.length - 1);
            songList = JSON.parse(songList).cdlist[0];
            // console.log(songList);
            pageObj.setData({
                detailLoading: true,
                songList: formatData(songList),
            })
            // console.log(e.data.songList);
        })
    })
}

function formatData(data) {
    let songList = {};
    songList.listname = data.dissname;
    songList.bgImage = data.logo;
    let songs = [];
    for (let i = 0; i < data.songlist.length; i++) {
        songs[i] = createSong(data.songlist[i]);
    }
    songList.songs = songs;
    return songList;
}

function createSong(songItem) {
    let song = {
        songid: songItem.id,
        songmid: songItem.mid,
        songname: songItem.title,
        singername: filterSinger(songItem.singer),
        album: songItem.album.title,
        songImg: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${songItem.album.mid}.jpg?max_age=2592000`,
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
    getRecommend: getRecommend,
    goRecDetail: goRecDetail
}