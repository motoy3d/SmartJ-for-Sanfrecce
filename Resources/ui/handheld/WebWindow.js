/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 * @param {Object} callback ブロック時に呼び出すNewsWindowのfunction
 */
function WebWindow(webData, callback) {
    var config = require("/config").config;
	var style = require("util/style").style;
    var util = require("util/util").util;
	var newsSource = require("model/newsSource");
    var XHR = require("/util/xhr");
    var social;
    if(util.isiOS()) {
        social = require('de.marcelpociot.social');
    }
	//TODO style.js
	var self = Ti.UI.createWindow({
		title: webData.title
        ,navBarHidden: webData.navBarHidden
        ,backgroundColor: style.common.backgroundColor
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
        ,titleAttributes: {
            color: style.common.navTintColor
        }
        ,top: 20
	});
	
    var webView = Ti.UI.createWebView();
    var flexSpace = Ti.UI.createButton({
        systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    // 閉じるボタン
    var closeBtn = Ti.UI.createButton({
        systemButton:Ti.UI.iPhone.SystemButton.STOP
    });
    closeBtn.addEventListener("click", function(e){
        self.close();
    });
    // オプションボタン
    var optionBtn = Ti.UI.createButton({
        systemButton:Ti.UI.iPhone.SystemButton.ACTION
    });
    var opts;
    if (webData.isBlockReportEnable) {
		var opts = {
			options: ['リンクをコピー', 'Safariで開く', 'ブロック', '報告', 'キャンセル'],
			cancel: 4,
			destructive: 0
		};
    } else {
		var opts = {
			options: ['リンクをコピー', 'Safariで開く', 'キャンセル'],
			cancel: 2,
			destructive: 0
		};
    }
	optionBtn.addEventListener('click', function(e){
		var dialog = Ti.UI.createOptionDialog(opts);
		dialog.addEventListener('click', function(e) {
			if (e.index == 0) {	//リンクをコピー
				Ti.UI.Clipboard.setText(webView.url);
			} else if (e.index == 1) {	//Safariで開く
				Ti.Platform.openURL(webView.url);
			} else if (e.index == 2 && webData.isBlockReportEnable) {	//ブロック
				var dialog = Ti.UI.createAlertDialog({
					title: ""
					,message: "このサイトをブロックして、今後表示しないようにしますか？"
					,buttonNames: ["OK", "キャンセル"]
				});
				dialog.addEventListener('click', function(e){
					if (e.index == 0) {
				        var db = Ti.Database.open(config.dbName);
				        try {
				        	var date = util.formatDate();
				        	var domainEndSlashIdx = webView.url.indexOf("/", 8);	//8はhttps://の8文字
				        	Ti.API.info('domainEndSlashIdx=' + domainEndSlashIdx);
				        	var site = "";
				        	if (domainEndSlashIdx == -1) {	//ドメイン直下の場合
				        		site = webData.link;
			        		} else {
			        			var idx2 = webData.link.indexOf("/", domainEndSlashIdx+1);
			        			Ti.API.info('idx2=' + idx2);
					        	site = webData.link.substring(0, idx2 + 1);
			        		}
			        		if (!site) {
			        			return;
			        		}
			        		var rows = db.execute("SELECT COUNT(*) FROM blockSite WHERE url = '" + site + "'");
			        		if (rows.isValidRow() && rows.field(0) == 0) {
				        		Ti.API.info('ブロック：' + site + "    (" + webData.link + "), " + date);
					            db.execute('INSERT INTO blockSite(url, date) VALUES(?, ?)', site, date);
			        		}
				            util.showMsg("ブロックしました");
				            self.close();
				            callback.removeBlockedSite(site);
				        } finally{
				            db.close();
				        }
					}
				});
				dialog.show();
			} else if (e.index == 3 && webData.isBlockReportEnable) {	//報告
				var reportOpts = {
					options: ['興味がない', '迷惑', 'キャンセル'],
					cancel: 2,
					destructive: 0
				};
				var reportDialog = Ti.UI.createOptionDialog(reportOpts);
				reportDialog.addEventListener('click', function(e) {
					if (e.index == 2) {
						return;
					}
					var userId = Ti.App.Properties.getString("userId");
				    var xhr = new XHR();
				    var reportUrl = config.reportUrl + "&uid=" + userId + "&type=" + e.index +  "&url=" + escape(webView.url);
				    Ti.API.info('##### 報告: ' + reportUrl);
				    xhr.get(reportUrl, onSuccessCallback, onErrorCallback);
				    function onSuccessCallback(e) {
				        Ti.API.info('報告完了');
					};
				    function onErrorCallback(e) {
				        Ti.API.error('報告時エラー');
					};
					util.showMsg("ご報告ありがとうございました。");
		            self.close();
				});
				reportDialog.show();
			}
		});
		dialog.show();
	});
    var back;
    var forward;
    var facebook;
    var twitter;
    var line;
    if(webData.toolbarVisible) { //twitter画面以外から遷移した場合
    	createToolbar();
    }
    addWebViewEventListener();
    
    //tweetから来た場合
    if(webData.html) {
        webView.html = webData.html;
        webView.scalesPageToFit = false;
        self.add(webView);
    }
	else {
		Ti.API.debug("----------- 2  link = " + webData.link);
        webView.scalesPageToFit = true;
		webView.setUrl(webData.link);
		self.add(webView);
	}
	
	/**
	 * WebViewイベントリスナ設定
	 */
	function addWebViewEventListener() {
        var ind;
        webView.addEventListener('beforeload',function(e){
            //Ti.API.info('beforeload ' + util.toString(e));
            //NGサイト遮断
            for(var i=0; i<Ti.App.ngSiteList.length; i++) {
            	//Ti.API.info('NGサイトチェック：' + Ti.App.ngSiteList[i]);
	            if(e.url.indexOf(Ti.App.ngSiteList[i]) != -1) {
	            	Ti.API.info('🔵NGサイト遮断 ' + e.url);
	            	webView.goBack();
					var dialog = Ti.UI.createAlertDialog({
					   message: 'このサイトは有害な内容が含まれる可能性があるため表示できません。',
					   ok: 'OK',
					   title: 'メッセージ'
					});
					dialog.show();            	
	            	self.close();
	            	return;
	            }
			}
            if(!ind && e.navigationType != 5) {//リンク先URLのhtml中の画像やiframeの場合、5
                Ti.API.info('beforeload #################### ');
                Ti.API.info("e = " + util.toString(e));
                //webView.opacity = 0.8;
                //Ti.API.info(util.formatDatetime2(new Date()) + '  インジケータshow');
//                webView.add(ind);
//TODO style
                ind = Ti.UI.createActivityIndicator({
                    style:Ti.UI.ActivityIndicatorStyle.DARK
                });
                webView.add(ind);
                ind.show();
                // webView.url = e.url;
                //Ti.API.info('beforeload end-------------------------------- ');
            }
        }); 
        // ロード完了時にインジケータを隠す
        webView.addEventListener("load", function(e) {
            // Ti.API.info('loadEvent1 e.navigationType=' + e.navigationType);
            // if(ind && e.navigationType != 5) {
            webView.scalesPageToFit = true;
            if(ind) {
                Ti.API.info('load1 ####################');
                Ti.API.info(util.toString(e));
                Ti.API.info(util.formatDatetime2(new Date()) + '  インジケータhide');
                webView.opacity = 1.0;
                ind.hide();
                ind = null;
                Ti.API.info('load end-------------------------------- ');
            }
            //ツールバーボタン制御
            if(webData.toolbarVisible) {
                var title = webView.evalJS("document.title");
                //FBの写真、レッズプレスの場合は上書きしない
                if(title != "" && title != "タイムラインの写真") {
                    self.title = title;
                }
                back.setEnabled(webView.canGoBack());
                forward.setEnabled(webView.canGoForward());
                line.setEnabled(true);
                twitter.setEnabled(true);
                facebook.setEnabled(true);
            }
        });
	}
	
	/**
	 * ツールバーを生成する。
	 */
	function createToolbar() {
	    Ti.API.info('🌟ツールバー作成');
    	//ツールバー
        back = Ti.UI.createButton({
            image: "/images/arrow_left.png"
            ,enabled: false
        });
        back.addEventListener("click", function(e){
            webView.goBack();
        });
        forward = Ti.UI.createButton({
            image: "/images/arrow_right.png"
            ,enabled: false
        });
        forward.addEventListener("click", function(e){
            webView.goForward();
        });
        // LINE
        line = Ti.UI.createButton({
            image: "/images/line_logo.png"
            ,enabled: false
        });
        
        // twitterはiOS5で統合されたが、titanium-social-modulは
        // FB(iOS6から)が含まれているためiOS5でエラーになる。
        twitter = Ti.UI.createButton({
            image: "/images/twitter_icon.png"
            ,enabled: false
        });
        facebook = Ti.UI.createButton({
            image: "/images/facebook_icon.png"
            ,enabled: false
        });
        // lineで送るボタン
        line.addEventListener("click", lineSend);
        // twitterボタン
        twitter.addEventListener("click", tweet);
        // facebookボタン
        facebook.addEventListener("click", facebookShareBySocialModule);
        var barItems = [optionBtn, line, twitter, facebook, flexSpace, back, flexSpace, forward, flexSpace, closeBtn];
        self.setToolbar(barItems, style.news.webWindowToolbar);
    }
    /**
     * LINEに投稿する。
     */
    function lineSend(e) {
        Ti.App.Analytics.trackPageview('/lineDialog');   //ダイアログを開く
        var link = webView.url; 
        var title = webView.evalJS("document.title");
        if(!title || link.indexOf("redspress") != -1) {
            //レッズプレスはjquery mobileを使用しており、titleタグが上書きされてしまうため
            title = webData.titleFull;
        }
        var msg = encodeURIComponent(title + "  ") + link;
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
    /**
     * twitterに投稿する。
     */
    function tweet(e) {
        Ti.App.Analytics.trackPageview('/tweetDialog');   //ダイアログを開く
        var link = webView.url; 
        var title = webView.evalJS("document.title");
        if(!title || link.indexOf("redspress") != -1) {
            //レッズプレスはjquery mobileを使用しており、titleタグが上書きされてしまうため
            title = webData.titleFull;
        }
        social.showSheet({
            service:  'twitter',
            message:  title + "#" + config.hashtag,
            urls:       [link],
            success:  function(){
                Ti.API.info('ツイート成功');
                Ti.App.Analytics.trackPageview('/tweet');
            },
            error: function(){
                util.showMsg("iPhoneの設定でTwitterアカウントを登録してください。");
            }
        });
    }
    /**
     * facebookでシェアする(titanium-social-modul使用。iOS6から可)
     */ 
    function facebookShareBySocialModule() {
        Ti.App.Analytics.trackPageview('/fbShareDialog');   //ダイアログを開く
        var link = webView.url; 
        Ti.API.info('facebook share >>>>>>>> ' + link);

        social.showSheet({
            service:  'facebook',
            message:  "",
            urls:       [link],
            success:  function(){
                Ti.API.info('FBシェア成功');
                Ti.App.Analytics.trackPageview('/fbShare');
            },
            error: function(){
                util.showMsg("iPhoneの設定でFacebookアカウントを登録してください。");
            }
        });
    }
    /**
     * facebookでシェアする
     */	
	function facebookShareByWebView() {
        var link = webView.url; 
        Ti.API.info('facebookシェア link=' + link);
        var data = {
            link : link
            ,locale : "ja_JP"
        };
        Ti.App.Analytics.trackPageview('/fbShareDialog');   //ダイアログを開く
        //投稿ダイアログを表示
        Ti.Facebook.dialog(
            "feed", 
            data, 
            function(r){
                if(r.success) {
                    Ti.App.Analytics.trackPageview('/fbShare'); //投稿成功
                }
            }
        );
	}
	return self;
};

module.exports = WebWindow;
