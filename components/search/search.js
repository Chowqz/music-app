//search.js
function getHotkey(pageObj) {
    wx.request({
        url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=1503624223695',
        success: function(res) {
            let hotkey = [];
            for (let i = 0; i < 10; i++) {
                hotkey.push(res.data.data.hotkey[i]);
            }
            pageObj.setData({
                request: {
                    Recommend: pageObj.data.request.Recommend,
                    Toplist: pageObj.data.request.Toplist,
                    Search: true
                },
                hotkey: hotkey
            });
            // console.log(e.data.hotkey);
        }
    })
}


function search(pageObj, keyword) {
    wx.showLoading({
        title: '正在加载中',
        mask: true
    })
    wx.request({
        url: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
        data: {
            g_tk: 5381,
            uin: 0,
            format: 'json',
            inCharset: 'utf-8',
            outCharset: 'utf-8',
            notice: 0,
            platform: 'h5',
            needNewCode: 1,
            w: keyword,
            zhidaqu: 1,
            catZhida: 1,
            t: 0,
            flag: 1,
            ie: 'utf-8',
            sem: 1,
            aggr: 0,
            perpage: 20,
            n: 20,
            p: pageObj.data.searchResult.p,
            remoteplace: 'txt.mqq.all',
            _: 1503829962664,
        },
        success: function(res) {
            wx.hideLoading();
            if(res.data.data.song.list.length==0){
                wx.showModal({
                  content: `很抱歉，没有找到与“${keyword}”相关的结果.`,
                  showCancel: false
                })
                pageObj.setData({
                    searchResult: {
                        p: 1,
                        loading: false,
                        dataEnd: true,
                        songlist: []
                    }
                })
                return;
            }
            if(res.data.data.song.list.length<20){
                pageObj.setData({
                    searchResult: {
                        p: pageObj.data.searchResult.p+1,
                        loading: false,
                        dataEnd: true,
                        songlist: formatData(res.data.data.song.list)
                    }
                })
                return;
            }
            pageObj.setData({
                searchResult: {
                    p: pageObj.data.searchResult.p+1,
                    loading: false,
                    dataEnd: false,
                    songlist: formatData(res.data.data.song.list)
                }
            })
        },
        fail: function() {
            wx.hideLoading();
            wx.showModal({
              content: '搜索失败',
              showCancel: false
            })
            pageObj.setData({
                searchResult: {
                    p: pageObj.data.searchResult.p,
                    loading: false,
                    songlist: []
                }
            })
        }
    })
}

function loadMore(pageObj) {
    if(pageObj.data.searchResult.p==1||pageObj.data.searchResult.loading||pageObj.data.searchResult.dataEnd){
        return;
    }
    pageObj.setData({
        searchResult: {
            p: pageObj.data.searchResult.p,
            loading: true,
            songlist: pageObj.data.searchResult.songlist
        }
    })
    let timer=setTimeout(function(){
        wx.request({
            url: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
            data: {
                g_tk: 5381,
                uin: 0,
                format: 'json',
                inCharset: 'utf-8',
                outCharset: 'utf-8',
                notice: 0,
                platform: 'h5',
                needNewCode: 1,
                w: pageObj.data.keyword,
                zhidaqu: 1,
                catZhida: 1,
                t: 0,
                flag: 1,
                ie: 'utf-8',
                sem: 1,
                aggr: 0,
                perpage: 20,
                n: 20,
                p: pageObj.data.searchResult.p,
                remoteplace: 'txt.mqq.all',
                _: 1503829962664,
            },
            success: function(res) {
                if(res.data.data.song.list.length==0){
                    pageObj.setData({
                        searchResult: {
                            p: pageObj.data.searchResult.p,
                            loading: false,
                            dataEnd: true,
                            songlist: pageObj.data.searchResult.songlist
                        }
                    })
                    return;
                }
                let songlist=pageObj.data.searchResult.songlist;
                songlist=songlist.concat(formatData(res.data.data.song.list));
                pageObj.setData({
                    searchResult: {
                        p: pageObj.data.searchResult.p+1,
                        loading: false,
                        dataEnd: false,
                        songlist: songlist
                    }
                })
            },
            fail: function() {
                wx.showModal({
                  content: '请求失败',
                  showCancel: false
                })
                pageObj.setData({
                    searchResult: {
                        p: pageObj.data.searchResult.p,
                        loading: false,
                        songlist: pageObj.data.searchResult.songlist
                    }
                })
            }
        })
    },2000);
}

function formatData(data) {
    let songs = [];
    for (let i = 0; i < data.length; i++) {
        songs[i] = createSong(data[i]);
    }
    return songs;
}

function createSong(songItem) {
    let song = {
        songid: songItem.songid,
        songmid: songItem.songmid,
        songname: decode(songItem.songname),
        singername: filterSinger(songItem.singer),
        album: decode(songItem.albumtransname?songItem.albumtransname:songItem.albumname),
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
        ret.push(decode(s.name))
    })
    return ret.join(' / ')
}

function decode(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}

module.exports = {
    getHotkey: getHotkey,
    search: search,
    loadMore: loadMore
}