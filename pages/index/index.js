//index.js
var recommend = require('../../components/recommend/recommend.js')
var toplist = require('../../components/toplist/toplist.js')
var personal = require('../../components/personal/personal.js')
var search = require('../../components/search/search.js')
var songlist = require('../../components/songlist/songlist.js')
var player = require('../../components/player/player.js')
var playlist = require('../../components/playlist/playlist.js')
//获取应用实例
var app = getApp()
Page({
    data: {
        request: {
            Recommend: false,
            Toplist: false,
            Search: false
        },
        showIndex: 0,
        playerToggle: false,
        lastShowIndex: 0,
        recommend: {},
        topList: {},
        hotkey: [],
        detailLoading: false,
        songList: {},
        playList: {
            isShow: false,
            playlist: []
        },
        playlistScroll: 0,
        actualList: [],
        playMode: 0,
        currentSong: {},
        currentIndex: -1,
        playFlag: false,
        duration: "00:00",
        currentTime: "00:00",
        lyric: [],
        lineIndex: 0,
        scrollTop: 0,
        middlePos: 0,
        keyword: '',
        searchResult: {
            p: 1,
            loading: false,
            dataEnd: false,
            songlist: []
        },
        searchHistory: [],
        cancelShow: false,
        historyShow: false,
        userInfo: {
            nickName: '',
            avatar: ''
        },
        personalSongs: []
    },
    onLoad: function() {
        recommend.getRecommend(this);
        personal.getUserInfo(this);
        personal.getPersonalSongs(this);
    },
    onShow: function() {
        player.getMiddlePos(this);
    },
    goRecDetail: function(e) {
        recommend.goRecDetail(e, this);
    },
    goTopDetail(e) {
        toplist.goTopDetail(e, this);
    },
    tab: function(e) {
        this.setData({
            showIndex: e.currentTarget.dataset.index
        })
        if (this.data.showIndex == 1 && !this.data.request.Toplist) {
            toplist.getToplist(this);
        }
        if (this.data.showIndex == 3 && !this.data.request.Search) {
            search.getHotkey(this);
        }
    },
    back: function() {
        this.setData({
            showIndex: this.data.lastShowIndex
        })
    },
    togglePlayer: function() {
        this.setData({
            playerToggle: !this.data.playerToggle
        })
    },
    playThis: function(e) {
        if (e.currentTarget.dataset.tag == "songItem") {
            this.setData({
                currentIndex: e.currentTarget.dataset.index,
                playList: {
                    isShow: this.data.playList.isShow,
                    playlist: this.data.songList.songs
                },
                actualList: this.data.songList.songs
            })
        }
        if (e.currentTarget.dataset.tag == "personal") {
            this.setData({
                currentIndex: 0,
                playList: {
                    isShow: this.data.playList.isShow,
                    playlist: this.data.personalSongs
                },
                actualList: this.data.personalSongs
            })
        }
        player.initAudio(this);
        player.getLyric(this);
        player.resetActualList(this);
    },
    playToggle: function() {
        player.playToggle(this);
    },
    tabSong: function(e) {
        player.tabSong(this, e.currentTarget.dataset.dir);
    },
    changePlayMode: function() {
        let _this = this;
        player.changePlayMode(this);
    },
    collectToggle: function() {
        player.collectToggle(this);
    },
    getInput: function(e) {
        this.setData({
            keyword: e.detail.value
        })
    },
    search: function() {
        let keyword = this.data.keyword.replace(/(^\s*)|(\s*$)/g, "");
        if (keyword == '') {
            wx.showModal({
                content: '请输入搜索内容',
                showCancel: false
            })
            return;
        }
        let searchHistory = wx.getStorageSync('searchHistory') || [];
        searchHistory.unshift(keyword);
        if (searchHistory.length > 10) {
            searchHistory.splice(searchHistory.length - 1, 1);
        }
        wx.setStorageSync('searchHistory', searchHistory);
        this.setData({
            searchResult: {
                p: 1,
                loading: true,
                songlist: []
            },
            historyShow: false
        })
        search.search(this, keyword);
    },
    searchThis: function(e) {
        let keyword = e.currentTarget.dataset.keyword;
        this.setData({
            keyword: keyword,
            searchResult: {
                p: 1,
                loading: true,
                dataEnd: false,
                songlist: []
            }
        })
        search.search(this, keyword);
    },
    loadMore: function() {
        search.loadMore(this);
    },
    playAfterInsert: function(e) {
        player.insertSong(this, e.currentTarget.dataset.song);
        player.initAudio(this);
        player.getLyric(this);
    },
    cancelToggle: function() {
        this.setData({
            cancelShow: false,
            historyShow: false,
            searchResult: {
                p: 1,
                songlist: []
            }
        })
    },
    hideHot: function() {
        if (!this.data.cancelShow) {
            this.setData({
                historyShow: true,
                searchHistory: wx.getStorageSync('searchHistory')
            })
        }
        this.setData({
            cancelShow: true
        })
    },
    delThis: function(e) {
        let index = e.currentTarget.dataset.index;
        let searchHistory = this.data.searchHistory;
        searchHistory.splice(index, 1);
        wx.setStorageSync('searchHistory', searchHistory);
        this.setData({
            searchHistory: wx.getStorageSync('searchHistory')
        })
    },
    clearHistory: function() {
        let _this=this;
        wx.showModal({
            title: '提示',
            content: '确定删除搜索历史？',
            showCancel: true,
            success: function(res) {
                if (res.confirm) {
                    wx.removeStorageSync("searchHistory");
                    _this.setData({
                        searchHistory: wx.getStorageSync('searchHistory')
                    })
                } else if (res.cancel) {
                    return;
                }
            }
        })
    },
    // 显示播放列表
    togglePlaylist: function() {
        this.setData({
            playList: {
                isShow: !this.data.playList.isShow,
                playlist: this.data.playList.playlist
            }
        })
        playlist.scrollToCurrent(this);
    },
    delFromPlaylist: function(e) {
        let _this = this;
        playlist.delFromPlaylist(this, e.currentTarget.dataset.index, function() {
            // console.log(_this.data.actualList);
            if (!_this.data.actualList.length) {
                console.log('no music');
                player.stopAndClear();
                _this.setData({
                    playList: {
                        isShow: false,
                        playlist: _this.data.playList.playlist
                    }
                })
                return;
            }
            if (_this.data.actualList[_this.data.currentIndex].songid == _this.data.currentSong.songid) {
                return;
            }
            player.initAudio(_this);
            player.getLyric(_this);
        });
    },
    clearPlaylist: function(){
        let _this=this;
        playlist.clearPlaylist(this, function(){
            if (!_this.data.actualList.length) {
                console.log('no music');
                player.stopAndClear();
                return;
            }
        });
    },
    tabInPlaylist: function(e) {
        let _this = this;
        playlist.tabInPlaylist(this, e.currentTarget.dataset.song, function() {
            if (_this.data.actualList[_this.data.currentIndex].songid == _this.data.currentSong.songid) {
                return;
            }
            player.initAudio(_this);
            player.getLyric(_this);
        });
    },
    uncollect: function(e) {
        let _this = this;
        personal.uncollect(this, e.currentTarget.dataset.song, function() {
            player.isCollected(_this);
        })
    }
})