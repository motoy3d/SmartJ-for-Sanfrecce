/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
    Ti.API.info('-------------WebWindow. ' + webData.link);
	var util = require("/util/util").util;
    var style = require("/util/style").style;
	var newsSource = require("/model/newsSource");
	
	Ti.API.info('twitter check start');
	var twitterInstalled = util.isAppInstalled("com.twitter.android");
    Ti.API.info('facebook check start');
    var facebookInstalled = util.isAppInstalled("com.facebook.katana");
    Ti.API.info('line check start');
    var lineInstalled = util.isAppInstalled("jp.naver.line.android");
	Ti.API.info('--------------1 ' + twitterInstalled + ", " + facebookInstalled + ", " + lineInstalled);
	
	//TODO
	var self = Ti.UI.createWindow({
		title: webData.title
		,navBarHidden: true
	});
    Ti.API.info('--------------2 ' + self);
    var title = " " + util.removeLineBreak(webData.title);
    var shortTitle = title;
    if(title.length > 21) {
        shortTitle = title.substring(0, 21) + "...";
    }
    var titleBar = Ti.UI.createLabel(style.common.titleBar);
    titleBar.text = shortTitle;
	self.add(titleBar);
	var referrer = "";
	var webView = Ti.UI.createWebView({
	    width: Ti.UI.FILL
	    ,top: 0
        ,bottom: 46
	});
	Ti.API.info('--------------3 ');
    if (util.isAndroid()) {
        webView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
    }
    if(!webData.toolbarVisible) { //twitter画面から遷移した場合
        webView.bottom = 0;
    }

    if(webData.html) {  //tweet
        Ti.API.info("----------- 7");
        webView.html = webData.html;
        webView.scalesPageToFit = false;
        self.add(webView);
	} else {
        //var indWin = customIndicator.create();
        var loaded = false;
        webView.scalesPageToFit = true;
		webView.setUrl(webData.link);
		self.add(webView);	
        Ti.API.info("----------- 9");

        var ind = Ti.UI.createActivityIndicator({style: Ti.UI.ActivityIndicatorStyle.BIG});
        self.add(ind);
        ind.show();
        webView.addEventListener("load", function(e) {
            loaded = true;
            ind.hide();
        });
	}

    //ツールバー
    if(webData.toolbarVisible) { //twitter画面以外から遷移した場合
        createToolbar();
    }
    
    /**
     * ツールバーを生成する。
     */
    function createToolbar() {
        var back = Ti.UI.createButton(style.webWindow.backButton);
        back.addEventListener("click", function(e){
            referrer = webView.evalJS("document.referrer");
            Ti.API.info("referrer=" + referrer);
            //alert("referrer=" + referrer);
            if(referrer == "") {
                webView.url = "";
                webView.html = createWebContent(webData);
                titleBar.text = shortTitle;
                Ti.API.info('■webData.link=' + webData.link + ", content = " + webView.html);
                //TODO title
            } else {
                webView.goBack();
            }
        });
        var forward = Ti.UI.createButton(style.webWindow.forwardButton);
        forward.addEventListener("click", function(e){
            webView.goForward();
        });
        var twitter = Ti.UI.createButton(style.webWindow.twitterButton);
        var facebook = Ti.UI.createButton(style.webWindow.facebookButton);
        var line = Ti.UI.createButton(style.webWindow.lineButton);
        // WebViewロード前
        var beforeLoadFunc = function(e) {
            Ti.API.info('beforeload-------------------------');
            Ti.API.info(util.toString(e));
            if(referrer && e.url && e.url.indexOf("file://") == 0) {
                //referrerがnullでない場合があり、エラーになる。
                Ti.API.info('★★★★★★★★　e.url=' + e.url);
                //TODO
                // webView.url = "";
                // webView.html = createWebContent(webData);
                // titleBar.text = shortTitle;
            }
        };
        webView.addEventListener('beforeload', beforeLoadFunc);
        
        // WebViewロード時、戻るボタン、次へボタンの有効化、無効化
        var loadFunc = function(e) {
//            webView.scalesPageToFit = true;
            if(e.url.indexOf("http") == 0) {
                title = webView.evalJS("document.title");
                shortTitle = title;
                if(title && title.length > 21) {
                    shortTitle = title.substring(0, 21) + "...";
                }
            }
            Ti.API.info('load★　 title=' + title + "  e.url=" + e.url);
            titleBar.text = shortTitle;
            if(e.url && e.url.indexOf("file://") == 0) {
                back.setEnabled(false);
            } else {
                back.setEnabled(webView.canGoBack());
            }
            back.backgroundImage = back.enabled? "/images/arrow_left.png" : "/images/arrow_left_grey.png";
            forward.setEnabled(webView.canGoForward());
            forward.backgroundImage = forward.enabled? "/images/arrow_right.png" : "/images/arrow_right_grey.png";
            twitter.setEnabled(true);
            //facebook.setEnabled(webView.url.indexOf("facebook.com") == -1);
            facebook.setEnabled(true);
//            facebook.backgroundImage = "/images/facebook_icon.png";
            line.setEnabled(true);
        };
        webView.addEventListener('load', loadFunc);
    
        // twitterボタン
        twitter.addEventListener("click", function(e){
            try {
                Ti.App.Analytics.trackPageview('/tweetDialog');
                //sendToApp("com.twitter.android", "com.twitter.applib.PostActivity");
                //sendToApp("com.twitter.android", "com.twitter.applib.composer.TextFirstComposerActivity");
                //sendToApp("com.twitter.android", "com.twitter.android.composer.TextFirstComposerActivity");
                var twitterClass = util.getTwitterClass();  //モジュールでTwitter公式アプリからクラス名を取得
                util.sendToApp("com.twitter.android", twitterClass, title + " " + (webView.html? webData.link : webView.url));
            } catch(e) {
                var dialog = Ti.UI.createAlertDialog({
                    message: "Twitterアプリをインストールしてください",
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
        // facebookボタン
        facebook.addEventListener("click", function(e){
            try {
                Ti.App.Analytics.trackPageview('/fbShareDialog');
                //sendToApp("com.facebook.katana", "com.facebook.katana.ShareLinkActivity");
                util.sendToApp("com.facebook.katana", null, title + " " + (webView.html? webData.link : webView.url));
            } catch(e) {
                var dialog = Ti.UI.createAlertDialog({
                    message: "Facebookアプリをインストールしてください",
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
        // LINEボタン
        line.addEventListener("click", function(e){
            try {
                Ti.App.Analytics.trackPageview('/lineSendDialog');
                util.sendToApp("jp.naver.line.android", "jp.naver.line.android.activity.selectchat.SelectChatActivity", 
                    title + " " + (webView.html? webData.link : webView.url));
            } catch(e) {
                var dialog = Ti.UI.createAlertDialog({
                    message: "LINEアプリをインストールしてください",
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
        
        var toolbar = Ti.UI.createView(style.webWindow.toolbar);
        Ti.API.info('■ツールバー背景：' + toolbar.backgroundColor);
        toolbar.add(line);
        toolbar.add(twitter);
        toolbar.add(facebook);
        toolbar.add(back);
        toolbar.add(forward);
        self.add(toolbar);

    }
    /**
     * 簡易ページに表示するコンテンツを生成する。
     */
    function createWebContent(webData) {
        return webData.content + "<br/><br/>" 
            + "<a href=\"" + webData.link + "\">サイトを開く</a><br/><br/>";
    }
    
	return self;
};
module.exports = WebWindow;
