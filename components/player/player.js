//player.js
import Lyric from '../../common/js/lyric-parser.js'
const audio = wx.getBackgroundAudioManager();
var playFirstTime = true;
var lyricObj;
var eObj;

function initAudio(pageObj) {
    pageObj.setData({
        currentSong: pageObj.data.actualList[pageObj.data.currentIndex],
        duration: "00:00",
        currentTime: "00:00",
        lyric: [],
        lineIndex: 0,
        scrollTop: 0,
    })
    isCollected(pageObj);
    playFirstTime = true;
    audio.src = pageObj.data.currentSong.url;
    // audio.startTime = 180;
    audio.title = pageObj.data.currentSong.songname;
    audio.singer = pageObj.data.currentSong.singername;
    audio.epname = pageObj.data.currentSong.album;
    audio.coverImgUrl = pageObj.data.currentSong.songImg;
    audioApi(audio, pageObj);
}

function getLyric(pageObj) {
    if (lyricObj) {
        lyricObj.stop();
        lyricObj = null;
    }
    eObj = pageObj;
    let mid = pageObj.data.currentSong.songid;
    wx.request({
        url: 'https://route.showapi.com/213-2',
        data: {
            showapi_appid: '44778',
            showapi_sign: 'a484f893eef54e2680834e48e6fbdb18',
            musicid: mid
        },
        success: function(res) {
            if(res.data.showapi_res_body.ret_code!=0){
                let line={
                    time: 0,
                    txt: '该歌曲暂无歌词'
                };
                pageObj.setData({
                    lyric: [line]
                })
                return;
            }
            let lyric = res.data.showapi_res_body.lyric;
            lyric = lyric.replace(/&#(\d+);/g, (str, match) => String.fromCharCode(match));
            lyricObj = new Lyric(lyric, handleLyric);
            if(lyricObj.lines.length==0){
                let line={
                    time: 0,
                    txt: res.data.showapi_res_body.lyric_txt.replace(/(^\s*)|(\s*$)/g, "")
                };
                lyricObj.lines=[line];
            }
            pageObj.setData({
                lyric: lyricObj.lines
            })
        }
    })
}

function handleLyric({ lineNum, txt }) {
    eObj.setData({
        lineIndex: lineNum,
        scrollTop: (lineNum - eObj.data.middlePos + 1) * 40
    })
    // console.log(lineNum, txt);
}

function playToggle(pageObj) {
    if (pageObj.data.playFlag) {
        audio.pause();
    } else {
        audio.play();
    }
    if (lyricObj&&lyricObj.lines.length>1)
        lyricObj.togglePlay();
    pageObj.setData({
        playFlag: !pageObj.data.playFlag
    })
}

// 切歌方法
function tabSong(pageObj, dir) {
    let index = pageObj.data.currentIndex;
    if (dir == "prev") {
        index--;
        if (index < 0) {
            index = pageObj.data.actualList.length - 1;
        }
    } else {
        index++;
        if (index == pageObj.data.actualList.length) {
            index = 0;
        }
    }
    pageObj.setData({
        playFlag: false,
        currentIndex: index
    })
    initAudio(pageObj);
    getLyric(pageObj);
}

function audioApi(audioObj, pageObj) {
    audioObj.onPlay(function() {
        pageObj.setData({
            playFlag: true
        })
    })
    audioObj.onPause(function() {
        pageObj.setData({
            playFlag: false
        })
    })
    audioObj.onStop(function() {
        pageObj.setData({
            playFlag: false
        })
    })
    audioObj.onCanplay(function() {

    })
    audioObj.onTimeUpdate(function() {
        pageObj.setData({
            currentTime: format(audioObj.currentTime),
            percent: (audioObj.currentTime / audioObj.duration).toFixed(4) * 100,
        })
        if (playFirstTime) {
            pageObj.setData({
                duration: format(audioObj.duration)
            })
        }
        if (playFirstTime && lyricObj && lyricObj.lines.length>1) {
            lyricObj.seek((audioObj.currentTime + 0.7) * 1000);
            playFirstTime = false;
        }
    })
    audioObj.onEnded(function() {
        playByMode(pageObj);
    })
    audioObj.onWaiting(function() {

    })
    audioObj.onError(function() {
        pageObj.setData({
            playFlag: false
        })
    })
}

function format(interval) {
    interval = Math.ceil(interval);
    let m = parseInt(interval / 60);
    m = m < 10 ? ('0' + m) : m;
    let s = interval % 60;
    s = s < 10 ? ('0' + s) : s;
    return m + ':' + s;
}

function formatLyric(lyric) {
    let newLyric = [];
    let pattern = /\[\d{2}:\d{2}.\d{2}\]/;
    let lines = lyric.replace(/&#(\d+);/g, (str, match) => String.fromCharCode(match));
    lines = lines.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].substring(10) != '') {
            let line = {
                time: unFormat(lines[i].substring(0, 10)),
                text: lines[i].substring(10)
            }
            newLyric.push(line);
        }
    }
    return newLyric;
}

function unFormat(time) {
    let a = parseInt(time.substring(1, 3));
    let b = parseFloat(time.substring(4, 9));
    let c = parseFloat((a * 60 + b).toFixed(2));
    return c;
}


function getMiddlePos(e) {
    wx.createSelectorQuery().select('#rect').boundingClientRect(function(rect) {
        let h = rect.height - 230 - 20;
        let middlePos = Math.ceil(h / 2 / 40);
        e.setData({
            middlePos: middlePos
        })
    }).exec()
}

function collectToggle(pageObj) {
    pageObj.setData({
        currentSong: {
            songid: pageObj.data.currentSong.songid,
            songmid: pageObj.data.currentSong.songmid,
            songname: pageObj.data.currentSong.songname,
            singername: pageObj.data.currentSong.singername,
            album: pageObj.data.currentSong.album,
            songImg: pageObj.data.currentSong.songImg,
            url: pageObj.data.currentSong.url,
            collectFlag: !pageObj.data.currentSong.collectFlag
        }
    })
    let personalSongs = wx.getStorageSync('personalSongs') || [];
    if (pageObj.data.currentSong.collectFlag) {
        personalSongs.unshift(pageObj.data.currentSong);
    } else {
        let index = findIndex(personalSongs, pageObj.data.currentSong);
        personalSongs.splice(index, 1);
    }
    wx.setStorageSync('personalSongs', personalSongs);
    pageObj.setData({
        personalSongs: wx.getStorageSync('personalSongs')
    })
}

function isCollected(pageObj) {
    let collectFlag = findIndex(pageObj.data.personalSongs, pageObj.data.currentSong);
    collectFlag = (collectFlag >= 0) ? true : false;
    pageObj.setData({
        currentSong: {
            songid: pageObj.data.currentSong.songid,
            songmid: pageObj.data.currentSong.songmid,
            songname: pageObj.data.currentSong.songname,
            singername: pageObj.data.currentSong.singername,
            album: pageObj.data.currentSong.album,
            songImg: pageObj.data.currentSong.songImg,
            url: pageObj.data.currentSong.url,
            collectFlag: collectFlag
        }
    })
}


function playByMode(pageObj) {
    let index;
    if (pageObj.data.playMode == 1) {
        pageObj.setData({
            lineIndex: 0,
            scrollTop: 0,
        })
        audio.src = pageObj.data.currentSong.url;
        playFirstTime=true;
    }
    else{
        if (pageObj.data.currentIndex == pageObj.data.actualList.length - 1) {
            index = 0;
        } else {
            index = pageObj.data.currentIndex + 1;
        }
        pageObj.setData({
            playFlag: false,
            currentIndex: index
        })
        playFirstTime = true;
        initAudio(pageObj);
        getLyric(pageObj);
    }
}

function changePlayMode(pageObj) {
    let playMode = pageObj.data.playMode;
    playMode++;
    if (playMode > 2) {
        playMode = 0;
    }
    pageObj.setData({
        playMode: playMode
    })
    resetActualList(pageObj);
}

function insertSong(pageObj, song) {
    let aIndex = findIndex(pageObj.data.actualList, song);
    let actualList = pageObj.data.actualList;
    actualList.splice(pageObj.data.currentIndex + 1, 0, song);
    if (aIndex > -1) {
        if (pageObj.data.currentIndex >= aIndex) {
            actualList.splice(aIndex, 1)
            pageObj.setData({
                currentIndex: pageObj.data.currentIndex,
                actualList: actualList
            })
        } else {
            actualList.splice(aIndex + 1, 1);
            pageObj.setData({
                currentIndex: pageObj.data.currentIndex + 1,
                actualList: actualList
            })
        }
    } 
    else {
        pageObj.setData({
            currentIndex: pageObj.data.currentIndex + 1,
            actualList: actualList
        })
    }
    let currentPIndex = findIndex(pageObj.data.playList.playlist, pageObj.data.currentSong);
    let pIndex = findIndex(pageObj.data.playList.playlist, song);
    let playlist = pageObj.data.playList.playlist;
    playlist.splice(currentPIndex + 1, 0, song);
    if (pIndex > -1) {
        if (currentPIndex > pIndex) {
            playlist.splice(pIndex, 1);
        } else {
            playlist.splice(pIndex + 1, 1);
        }
    }
    pageObj.setData({
        playList: {
            isShow: pageObj.data.playList.isShow,
            playlist: playlist
        }
    })
}

function getRandomIndex(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function resetActualList(pageObj) {
    let playlist = pageObj.data.playList.playlist.slice(0);
    if (pageObj.data.playMode == 2) {
        for (let i = 0; i < playlist.length; i++) {
            let temp = playlist[i];
            let j = getRandomIndex(0, i);
            playlist[i] = playlist[j];
            playlist[j] = temp;
        }
    }
    let newCurrentIndex = findIndex(playlist, pageObj.data.currentSong);
    pageObj.setData({
        currentIndex: newCurrentIndex,
        actualList: playlist
    })
    // console.log(pageObj.data.actualList);
}

function stopAndClear() {
    audio.stop();
    if (lyricObj) {
        lyricObj.stop();
        lyricObj = null;
    }
}

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.songid === song.songid
    })
}

module.exports = {
    initAudio: initAudio,
    getLyric: getLyric,
    playToggle: playToggle,
    getMiddlePos: getMiddlePos,
    tabSong: tabSong,
    changePlayMode: changePlayMode,
    resetActualList: resetActualList,
    collectToggle: collectToggle,
    isCollected: isCollected,
    insertSong: insertSong,
    stopAndClear: stopAndClear
}