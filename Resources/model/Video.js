/**
 * 試合関連動画取得サービス
 */
function Video(gameDate, otherTeamId) {
    var config = require("/config").config;
	var util = require("util/util").util;
    var style = require("util/style").style;
    var XHR = require("util/xhr");
	var self = {};
	self.load = load;
    var videoUrl = config.videoUrl + "&gameDate=" + gameDate;
    if (otherTeamId) {
        videoUrl += "&otherTeamId=" + otherTeamId;
    }
    
	/**
	 * 自前サーバからJSONを読み込んで表示する
	 */
	function load(callback) {
        var before = new Date();
	    Ti.API.info('---------------------------------------------------------------------');
	    Ti.API.info(util.formatDatetime() + '  動画読み込み');
        Ti.API.info('---------------------------------------------------------------------');
        
		// オンラインチェック
		if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
		}
        Ti.App.Analytics.trackPageview('/video');

        var xhr = new XHR();
        Ti.API.info('videoUrl=' + videoUrl);
        xhr.get(videoUrl, onSuccessCallback, onErrorCallback, { ttl: 1 });
        function onSuccessCallback(e) {
            Ti.API.info("e.status==" + e.status);
            if(!e.data) {
                callback.fail(style.common.loadingFailMsg);
                return;
            }
            try {
                var dataList = JSON.parse(e.data);
                var videoDataList = new Array();
                for(i=0; i<dataList.length; i++) {
                    var v = dataList[i];
                    var video_url = v.video_url;
                    var video_title = v.video_title;
                    var thumbnail_url = v.thumbnail_url;
                    var view_count = v.view_count;
                    var like_count = v.like_count;
                    var dislike_count = v.dislike_count;
                    
                    var videoData = {
                        videoUrl: video_url
                        ,videoTitle: video_title
                        ,thumbnailUrl: thumbnail_url
                        ,viewCount: view_count
                        ,likeCount: like_count
                        ,dislikeCount: dislike_count
                    };
                    videoDataList.push(videoData);
                }
                Ti.API.info('videoDataList = ' + videoDataList);
                callback.success(videoDataList);
            } catch(ex) {
                Ti.API.error('---------------------\n' + ex);   
                callback.fail(style.common.loadingFailMsg);
            } finally {
                var after = new Date();
                Ti.API.info("Video.js#load() 処理時間★　" 
                    + (after.getTime()-before.getTime())/1000.0 + "秒");
            }
        };
        function onErrorCallback(e) {
            Ti.API.error(e);
        }
	}
	return self;
}
module.exports = Video;
