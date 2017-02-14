/**
 * 設定画面を表示するウィンドウ
 */
function ConfigWindow(webData) {
	var util = require("/util/util").util;
    var style = require("/util/style").style;
    var config = require("/config").config;
    var social;
    if(util.isiOS()) {
        social = require('de.marcelpociot.social');
    }

	var self = Ti.UI.createWindow(style.config.window);
	self.barColor = style.common.barColor;
    var table = Ti.UI.createTableView(style.config.tableView);
    self.add(table);
            
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
    // 開発元にメールする    
    var mailToDeveloperRow = Ti.UI.createTableViewRow(style.config.mailToDeveloperRow);
    table.appendRow(mailToDeveloperRow);
    // 利用規約    
    var ruleRow = Ti.UI.createTableViewRow(style.config.ruleRow);
    table.appendRow(ruleRow);
    
    table.addEventListener("click", function(e){
        if(e.index == 0) { //友達にLINEですすめる
            Ti.App.Analytics.trackPageview('/lineDialogForAppShare');
            var msg = encodeURIComponent(config.appName + "  ") + util.getAppUrl();
            Ti.API.info("LINEへのパラメータ=" + msg);
            var opened = Ti.Platform.openURL("line://msg/text/" + msg);
            if (!opened) {
	            var dialog = Ti.UI.createAlertDialog({
	                message: "LINEをインストールしてください。",
	                buttonNames: ['OK']
	            });
	            dialog.show();
            }
        }
        else if(e.index == 1) { //友達にメールですすめる
            Ti.App.Analytics.trackPageview('/mailDialogForAppShare');
            var dialog = Ti.UI.createEmailDialog({
                subject: config.appName
                ,messageBody: config.appName + "  " + util.getAppUrl()
            });
            dialog.open();
        }
        else if(e.index == 2) { //twitterでつぶやく
            Ti.App.Analytics.trackPageview('/twitterDialogForAppShare');
            if(util.isiOS()) {
                social.showSheet({
                    service:  'twitter',
                    message:  config.appName + "  " + util.getAppUrl() + " #" + config.hashtag,
                    urls:       [],
                    success:  function(){
                        Ti.API.info('ツイート成功');
                        Ti.App.Analytics.trackPageview('/tweetForAppShare');
                    },
                    error: function(){
                        util.showMsg("iPhoneの設定でTwitterアカウントを登録してください。");
                    }
                });
            } else {
	            var msg = encodeURIComponent(config.appName + "  ") + util.getAppUrl() + "%20#" + config.hashtag;
	            Ti.API.info("twitterへのパラメータ=" + msg);
	            var opened = Ti.Platform.openURL("twitter://post?message=" + msg);
	            if (!opened) {
		            var dialog = Ti.UI.createAlertDialog({
		                message: "twitterをインストールしてください。",
		                buttonNames: ['OK']
		            });
		            dialog.show();
	            }
            }
        }
        else if(e.index == 3) { //FBでシェア
            Ti.App.Analytics.trackPageview('/fbShareDialogForAppShare');
            if(util.isiOS()) {
                social.showSheet({
                    service:  'facebook',
                    message:  config.appName + "  " + util.getAppUrl() + "  #" + config.hashtag,
                    urls:       [util.getAppUrl()],
                    success:  function(){
                        Ti.API.info('FB投稿成功');
                        Ti.App.Analytics.trackPageview('/fbShareForAppShare');
                    },
                    error: function(){
                        util.showMsg("iPhoneの設定でFacebookアカウントを登録してください。");
                    }
                });
            } else {
                util.sendToApp("com.facebook.katana", null, config.appName + "  " + util.getAppUrl() + " #" + config.hashtag);
            }
        }
        else if(e.index == 4) { //アプリレビュー
            Ti.API.info('アプリレビュー');
            Ti.App.Analytics.trackPageview('/appReview');
            Ti.Platform.openURL(util.getAppUrl());
        }
        else if(e.index == 5) { //開発元にメールする
            Ti.App.Analytics.trackPageview('/mailToDeveloper');
            var dialog = Ti.UI.createEmailDialog({
                toRecipients: [config.developerMail]
                ,subject: config.appName + " ご意見・お問い合わせ"
                ,messageBody: ""
            });
            dialog.open();
        }
        else if(e.index == 6) { //利用規約
            Ti.App.Analytics.trackPageview('/rules');
            var webView = Ti.UI.createWebView();
		    webView.url = config.rulesUrl + encodeURI(config.appName);
			var ruleWin = Ti.UI.createWindow({
				title: "利用規約"
			    ,backgroundColor: style.common.backgroundColor
			    ,barColor: style.common.barColor
			    ,navTintColor: style.common.navTintColor
			    ,titleAttributes: {
			        color: style.common.navTintColor
			    }
			});
			ruleWin.add(webView);
			Ti.App.tabGroup.activeTab.open(ruleWin, {animated: true});
        }
    });
	return self;
};
module.exports = ConfigWindow;
