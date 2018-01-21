//app.js
App({
    globalData: {
        audio: wx.getBackgroundAudioManager(),
        playFlag: false,
        currentSong: {
            songid: "",
            songmid: "",
            songname: "未知",
            singername: "未知",
            album: "未知",
            songImg: "",
            url: ""
        },
        currentIndex: -1
    },
    initAudio() {
        this.globalData.audio.src = this.globalData.currentSong.url;
        this.globalData.audio.title = this.globalData.currentSong.songname;
        this.globalData.audio.singer = this.globalData.currentSong.singername;
        this.globalData.audio.epname = this.globalData.currentSong.album;
        this.globalData.playFlag=true;
    },
    playToggle() {
        this.globalData.playFlag=!this.globalData.playFlag;
        if(this.globalData.playFlag){
            this.globalData.audio.play();
        }
        else{
            this.globalData.audio.pause();
        }
    },
    onCanplay() {
        
    },
    onTimeUpdate() {},
    onEnded() {},
    onWaiting() {},
    onError() {}
})