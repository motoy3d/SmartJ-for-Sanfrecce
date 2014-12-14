/**
 * 設定画面を表示するウィンドウ
 */
function ConfigWindow(webData) {
	var util = require("/util/util").util;
    var style = require("/util/style").style;
    var config = require("/config").config;
    var social;
    if(util.isiPhone()) {
        social = require('de.marcelpociot.social');
    }

	var self = Ti.UI.createWindow(style.config.window);
	self.barColor = style.common.barColor;
    var table = Ti.UI.createTableView(style.config.tableView);
    self.add(table);
    
    // 簡易記事モード //iPhoneのみとしておく
    if(util.isiPhone()){
        var dispModeRow = Ti.UI.createTableViewRow({
            width: Ti.UI.FILL
            ,height: 50
        });
        var simpleDispModeLabel = Ti.UI.createLabel({
            text: "簡易記事モード(高速)"
            ,color: "white"
            ,left: 15
        });
        dispModeRow.add(simpleDispModeLabel);
        
        var simpleDispModeProp = Ti.App.Properties.getBool("simpleDispMode");
        Ti.API.info('dispModeProp=========' + simpleDispModeProp);
        if(simpleDispModeProp == null || simpleDispModeProp == undefined) {
            simpleDispModeProp = false;
        }
        var simpleDispModeSwitch = Ti.UI.createSwitch({
            value: simpleDispModeProp
            ,right: 10
            ,verticalAlign: "center"
            // ,top: 20
        });
        //プロパティ保存
        simpleDispModeSwitch.addEventListener("change", function(){
            Ti.App.Properties.setBool("simpleDispMode", simpleDispModeSwitch.value);
        });
        dispModeRow.add(simpleDispModeSwitch);
        table.appendRow(dispModeRow);
    } else {
        table.appendRow(Ti.UI.createTableViewRow());
    }
        
    // 友達にLINEですすめる    
    var lineRow = Ti.UI.createTableViewRow(style.config.lineRow);
    table.appendRow(lineRow);
    // 友達にメールですすめる    
    var mailRow = Ti.UI.createTableViewRow(style.config.mailRow);
    table.appendRow(mailRow);
    // twitterでつぶやく    
    var twitterRow = Ti.UI.createTableViewRow(style.config.twitterRow);
    table.appendRow(twitterRow);
    // facebookでシェア    
    var fbRow = Ti.UI.createTableViewRow(style.config.fbRow);
    table.appendRow(fbRow);
    // アプリレビュー    
    var appReviewRow = Ti.UI.createTableViewRow(style.config.appReviewRow);
    table.appendRow(appReviewRow);
    
    table.addEventListener("click", function(e){
        if(e.index == 1) { //友達にLINEですすめる
            Ti.App.Analytics.trackPageview('/lineDialogForAppShare');
            var msg = encodeURIComponent(config.appName + "  ") + util.getAppUrl();
            Ti.API.info("LINEへのパラメータ=" + msg);
            Ti.Platform.openURL("line://msg/text/" + msg);
        }
        else if(e.index == 2) { //友達にメールですすめる
            Ti.App.Analytics.trackPageview('/mailDialogForAppShare');
            var dialog = Ti.UI.createEmailDialog({
                subject: config.appName
                ,messageBody: config.appName + "  " + util.getAppUrl()
            });
            dialog.open();
        }
        else if(e.index == 3) { //twitterでつぶやく
            Ti.App.Analytics.trackPageview('/twitterDialogForAppShare');
            if(util.isiPhone()) {
                social.showSheet({
                    service:  'twitter',
                    message:  config.appName + "  " + config.iPhoneAppUrl + " #" + config.hashtag,
                    urls:       [],
                    success:  function(){
                        Ti.API.info('ツイート成功');
                        Ti.App.Analytics.trackPageview('/tweetForAppShare');
                    },
                    error: function(){
                        alert("iPhoneの設定でTwitterアカウントを登録してください。");
                    }
                });
            } else {
                var twitterClass = util.getTwitterClass();  //モジュールでTwitter公式アプリからクラス名を取得
                util.sendToApp("com.twitter.android", twitterClass
                    ,config.appName + "  " + config.androidAppUrl + " #" + config.hashtag);
            }
        }
        else if(e.index == 4) { //FBでシェア
            Ti.App.Analytics.trackPageview('/fbShareDialogForAppShare');
            if(util.isiPhone()) {
                social.showSheet({
                    service:  'facebook',
                    message:  config.appName + "  #" + config.hashtag,
                    urls:       [config.iPhoneAppUrl],
                    success:  function(){
                        Ti.API.info('FB投稿成功');
                        Ti.App.Analytics.trackPageview('/fbShareForAppShare');
                    },
                    error: function(){
                        alert("iPhoneの設定でFacebookアカウントを登録してください。");
                    }
                });
            } else {
                util.sendToApp("com.facebook.katana", null, config.appName + "  " + config.androidAppUrl + " #" + config.hashtag);
            }
        }
        else if(e.index == 5) { //アプリレビュー
            Ti.API.info('アプリレビュー');
            Ti.App.Analytics.trackPageview('/appReview');
            Ti.Platform.openURL(util.getAppUrl());
        }
    });
	return self;
};
module.exports = ConfigWindow;
