/**
 * twitter取得サービス
 * @target searchTweets or playerTweets
 */
function Twitter(target) {
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var config = require("/config").config;
    var XHR = require("/util/xhr");
    
    var self = {};
    self.loadTweets = loadTweets;
    var tweetsPerPage = 25;
    var urlBase = 
        config.urlBase + target + ".json"
        + "?teamId=" + config.teamId + "&count=" + tweetsPerPage;
    var blockUserList = getBlockedUserList();

    /**
     * チームハッシュタグのツイート一覧を取得
     * @param kind ("firstTime" or "older" or "newer")
     * @param callback (TwitterWindow.js)
     */
    function loadTweets(kind, callback) {
        Ti.API.info('---------------------------------------------------------------------');
        Ti.API.info(util.formatDatetime() + '  twitter読み込み ' + kind);
        Ti.API.info('---------------------------------------------------------------------');
        // オンラインチェック
        if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
        }
        // Analytics
        trackAnalytics(kind);
        
        var before = new Date();
        var url = urlBase;
        if("newer" == kind) {
            Ti.API.info('#####newestId = ' + self.newestId);
            url += "&since_id=" + (Number(self.newestId)+100);   //なぜか最後の１件が再表示されてしまうので、100ずらす
        } else if("older" == kind){
            url += "&max_id=" + (self.oldestId - 1);
        }
        var xhr = new XHR();
        Ti.API.info(new Date() + ': URL=' + url);
        xhr.get(url, onSuccessCallback, onErrorCallback);
        function onSuccessCallback(e) {
            Ti.API.info(new Date() + ': xhr success');
            try {
                if(e.data == null) {
                    callback.fail(style.common.loadingFailMsg);
                    return;
                }
                var resultArray = JSON.parse(e.data);
                if(resultArray[0].json && "no data" == resultArray[0].json) {
                    callback.success(new Array());
                    return;
                }
                
                // 取得したJSONをリスト化する
                var idx = 0;
                var tweetList = resultArray.map(
                    function(item) {
                        //Ti.API.info('ツイートID=' + item.tweet_id);
                        if(idx++ == 0 && 
                            ("firstTime" == kind || "newer" == kind)) {
                            self.newestId = item.tweet_id;  //最も新しいツイートID。新しいデータ読み込み時に使用
                        }
                        if("firstTime" == kind || "older" == kind) {
                            self.oldestId = item.tweet_id;  //最も古いツイートID。古いデータ読み込み時に使用
                        }
					    // ブロック確認
					    var isBlocked = util.contains(blockUserList, item.user_screen_name);
					    if (isBlocked) {
					    	return null;
					    }
                        //「10秒前」のような形式
                        //var timeText = util.parseDate2(item.results.created_at);
                        var creDate = new Date(item.created_at);
                        var minutes = creDate.getMinutes();
                        if(minutes < 10) {
                            minutes = "0" + minutes;
                        }
                        var timeText = (creDate.getMonth() + 1) + "/" + creDate.getDate() 
                            + " " + creDate.getHours() + ":" + minutes;
 //                       Ti.API.info('★timeText=' + timeText);

                        var data = {
                            url: 'https://twitter.com/' + item.user_screen_name + '/status/' + item.tweet_id
                            ,contentView: {}
                            ,content: {
                                text: util.deleteUnnecessaryText(item.tweet)
                                , bottom: item.image_url? 250 : 6
                            }
//                            ,postImage: {image: profileImage, height: item.image_url? 240 : 0}
                            ,postImage: {image: item.image_url, height: item.image_url? 240 : 0}
                            ,userProfileImage: {image: item.user_profile_image_url}
                            // ブロック確認
                            //,userName: {text: (isBlocked?"(ブロック)" : "") + item.user_name}
                            ,userName: {text: item.user_name}
                            ,userScreenName: item.user_screen_name
                            ,publishedDatetime: item.created_at 
                            ,time: {text: timeText}
                            ,backgroundColor: style.common.backgroundColor

// 選択時背景色がAndroidで効かない
//                            ,selectedBackgroundColor: '#444'
//,properties: {selectedBackgroundColor: '#444'}
                        };
                        return data;
                    }
                );
                var tweetListFiltered = tweetList.filter(function(e){return e != null;});		//ブロックを排除
                Ti.API.info(new Date() + '+++++++++++++++++++ 読み込み終了.  ツイート件数＝' + tweetListFiltered.length);
                callback.success(tweetListFiltered);
            } catch(ex) {
                Ti.API.error('---------------------\n' + ex);  
                callback.fail(style.common.loadingFailMsg + " ¥n " + ex);
            } finally {
            }
            var after = new Date();
            Ti.API.info("Twitter.js#loadTweets() 処理時間★　" 
                + (after.getTime()-before.getTime())/1000.0 + "秒");
        };
        function onErrorCallback(e) {
            Ti.API.error(e);
        }
    }
    
    /**
     * Google Analyticsの記録
     * @param {Object} kind     firstTime/newer/older
     */
    function trackAnalytics(kind) {
        if("firstTime" == kind) {
            if(target == "playerTweets") {
                Ti.App.Analytics.trackPageview('/playerTweets');
            } else {
                Ti.App.Analytics.trackPageview('/twitter');
            }
        } else if("newer" == kind) {
            if(target == "playerTweets") {
                Ti.App.Analytics.trackPageview('/newerPlayerTweets');
            } else {
                Ti.App.Analytics.trackPageview('/twitter/newerTweets');
            }
        } else {
            if(target == "playerTweets") {
                Ti.App.Analytics.trackPageview('/olderPlayerTweets');
            } else {
                Ti.App.Analytics.trackPageview('/twitter/olderTweets');
            }
        }
    }
    /**
     * DBからブロックユーザーリストを返す
     */
    function getBlockedUserList() {
        Ti.API.info('■getBlockedUserList');
        var db = Ti.Database.open(config.dbName);
        var userList = new Array();
        try {
            var rows = db.execute('SELECT userScreenName, date FROM blockTwitterUser');
            while (rows.isValidRow()) {
                userList.push(rows.field(0));
                Ti.API.info('ブロックユーザー　######## ' + rows.field(0) + " : " + rows.field(1));
                rows.next();
            }
        } finally{
            db.close();
        }
        return userList;
    }

    return self;
}
module.exports = Twitter;
