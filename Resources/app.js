(function() {
    var config = require("/config").config;
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var XHR = require("/util/xhr");

	startAnalytics();
	initDB();
	// 起動回数保存
	var launchAppCount = Ti.App.Properties.getInt("LaunchAppCount");
	if (!launchAppCount) {
	    launchAppCount = 0;	//起動回数
	    Ti.App.Properties.setBool("shareAndReviewDoneFlg", false);	
	}
	if (util.isiOS()) {
		var eulaDone = Ti.App.Properties.getBool("eulaDone");
	    // 利用規約表示
		if (!eulaDone) {
			openEULA();
		}
	}
	Ti.App.Properties.setInt("LaunchAppCount", ++launchAppCount);
	Ti.API.info('アプリ起動 : ' + launchAppCount);
	// ユーザーID保存
	if (!Ti.App.Properties.getString("userId")) {
		Ti.App.Properties.setString("userId", Ti.Platform.osname + new Date().getTime());	//ユーザーID（カレントのミリ秒）
		Ti.API.info('ユーザーID保存: ' + Ti.App.Properties.getString("userId"));
	}
	
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		osversion = Ti.Platform.version,
        appversion = Ti.App.version,
		model = Ti.Platform.model,
		name = Ti.Platform.name,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth,
		density = Ti.Platform.displayCaps.density,
        logicalDensityFactor = Ti.Platform.displayCaps.logicalDensityFactor,
		dpi = Ti.Platform.displayCaps.dpi,
		xdpi = Ti.Platform.displayCaps.xdpi,
		ydpi = Ti.Platform.displayCaps.ydpi;
	Ti.API.info('★★　osname=' + osname);
	Ti.API.info('★★　osversion=' + osversion);
    Ti.API.info('★★　appversion=' + appversion);
    Ti.API.info('★★　name=' + name);
    Ti.API.info('★★　model=' + model);
	Ti.API.info('★★　width/height=' + width + "/" + height);
	Ti.API.info('★★　density=' + density);
    Ti.API.info('★★　logicalDensityFactor=' + logicalDensityFactor);
	Ti.API.info('★★　dpi=' + dpi);
    Ti.API.info('★★　xdpi=' + xdpi);
    Ti.API.info('★★　ydpi=' + ydpi);
    Ti.API.info('☆☆dpi from module=' + util.getDpi());
    Ti.App.Analytics.trackPageview("/startApp?m=" + model + "&v=" + osversion/* + "&wh=" + width + "x" + height*/);	

	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	if(osname == "iphone") {
        Ti.UI.iPhone.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
	}
	
	// 全置換：全ての文字列 org を dest に置き換える  
	String.prototype.replaceAll = function (org, dest) {  
	  return this.split(org).join(dest);  
	};
	//バイト数を返す。
	String.prototype.getBytes = function() {
        var count = 0;
        for (i=0; i<this.length; i++) {
            var n = escape(this.charAt(i));
            if (n.length < 4) count++; else count+=2;
        }
        return count;
	};
	Ti.App.adType = 2;    //広告タイプ(1:アイコン、2:バナー)
	
    //メッセージ
    var message = null;
    var xhr = new XHR();
    var confUrl = config.messageUrl + "&os=" + osname + "&osversion=" + osversion + "&appversion=" + appversion;
    Ti.API.info(new Date() + ' メッセージURL：' + confUrl);
    if (confUrl.indexOf("localhost") != -1|| confUrl.indexOf("192.168") != -1) {
    	alert("localhost");
    }
    xhr.get(confUrl, onSuccessCallback, onErrorCallback);
    function onSuccessCallback(e) {
        Ti.API.info('メッセージデータ:' + e.data);
        if(e.data) {
            var json = JSON.parse(e.data);
            if(json && json[0]) {
                Ti.App.jcategory = json[0].jcategory;    //Jリーグカテゴリ
                Ti.App.currentStage = json[0].currentStage;    //J1現在ステージ
                Ti.App.aclFlg = json[0].aclFlg;    //ALC出場フラグ(true/false)
                Ti.App.adType = json[0].adType;    //広告タイプ(1:アイコン、2:バナー)
                Ti.App.isOtherTeamNewsFeatureEnable = json[0].isOtherTeamNewsFeatureEnable;	//他チーム情報参照機能有効
                if(json[0].message){
                    message = json[0].message;
                }
                Ti.App.ngSiteList = json[0].ngSiteList;
                Ti.API.info('🌟NGサイトリスト=' + util.toString(Ti.App.ngSiteList));
            }
        }
        var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
        var tabGroup = new ApplicationTabGroup();
        // TabGroupをglobalにセット
        Ti.App.tabGroup = tabGroup;
        // スプラッシュイメージを一定時間表示
        Ti.API.info(new Date() + "-------------- WAIT START ------------------");
        var startTime = (new Date()).getTime();
        var waitMilliSeconds = 2000;
        while (true) {
            if ( ( new Date() ).getTime() >= startTime + waitMilliSeconds ) break;
        }
        if(osname == "iphone") {
            tabGroup.open({transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});      
        } else {
            tabGroup.open();
        }
        // メッセージがある場合は表示
        if(message) {
            var dialog = Ti.UI.createAlertDialog({title: 'お知らせ', message: message});
            dialog.show();
        }
        // シェア・レビュー依頼
        if ((launchAppCount == 5 || launchAppCount % 15 == 0) && eulaDone) {
        	openShareAndReviewWindow();
        }
    };
    function onErrorCallback(e) {
    };	
})();

/**
 * DB初期化
 */
function initDB() {
    var config = require("/config").config;
    var util = require("util/util").util;
    var db = Ti.Database.open(config.dbName);
    db.execute('CREATE TABLE IF NOT EXISTS visitedUrl (url TEXT, date INTEGER)');
    var date = new Date();
    var days = 10;
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000 * days);
    var condDate = "'" + util.formatDate(date) + "'";
    // 一定日数以前のデータを削除する
    var deleteSql = "DELETE FROM visitedUrl WHERE date < " + condDate;
    Ti.API.info('削除SQL:' + deleteSql);
    db.execute(deleteSql);
    // ユーザがブロックしたサイト
    db.execute('CREATE TABLE IF NOT EXISTS blockSite (url TEXT, date TEXT)');
    // ユーザがブロックしたtwitterユーザー
    db.execute('CREATE TABLE IF NOT EXISTS blockTwitterUser (userScreenName TEXT, date TEXT)');
    // テスト
    //db.execute("delete from blockSite");
    db.close();
}

/**
 * Google Analyticsの処理を初期化する
 */
function startAnalytics() {
    var config = require("/config").config;
    var Analytics = require('/util/Ti.Google.Analytics');
	var analytics = new Analytics(config.googleAnalyticsTrackingId);
    var util = require("util/util").util;
	Titanium.App.addEventListener('analytics_trackPageview', function(e){
	    var path = "/app/" + config.teamId + "/" + Ti.Platform.name;
	    analytics.trackPageview(path + e.pageUrl);
	});
	Ti.App.addEventListener('analytics_trackEvent', function(e){
	    analytics.trackEvent(e.category, e.action, e.label, e.value);
	});
	Ti.App.Analytics = {
	    trackPageview:function(pageUrl){
	        Ti.App.fireEvent('analytics_trackPageview', {pageUrl:pageUrl});
	    },
	    trackEvent:function(category, action, label, value){
	        Ti.App.fireEvent('analytics_trackEvent', {category:category, action:action, label:label, value:value});
	    }
	};
	analytics.start(7);	//7秒に1回データ送信
}

/**
 *  利用規約を表示する。（初回起動時）
 */
function openEULA() {
	var style = require("/util/style").style;
	var config = require("/config").config;
	var ruleWin = Ti.UI.createWindow();
	var navbar = Ti.UI.createView({
		width: Ti.UI.FILL
		,height: 40
		,top: 20
		,backgroundColor: style.common.barColor
	});
	var titleLabel = Ti.UI.createLabel({
		text: config.appName + " 利用規約"
		,color: style.common.navTintColor
		,font: {fontSize: 14}
	});
	navbar.add(titleLabel);
	ruleWin.add(navbar);

    var webView = Ti.UI.createWebView({
    	height:Ti.UI.SIZE
    	,width: "100%"
		,top: 60
		,bottom: 50
	});
//    webView.url = "/rules.html";
    webView.url = config.rulesUrl + encodeURI(config.appName);
    Ti.API.info('>>>>>>>>>>>>>>>>> 利用規約URL=' + webView.url);
	ruleWin.add(webView);
	
	var toolbar = Ti.UI.createView({
		width: Ti.UI.FILL
		,height: 50
		,bottom: 0
		,backgroundColor: "#ccc"
	});
	var closeBtn = Ti.UI.createButton({
		title: "同意する"
		,borderSize: 1
		,borderRadius: 1
	});
	closeBtn.addEventListener("click", function(){
		Ti.App.Properties.setBool("eulaDone", true);	//同意済フラグを保存
		ruleWin.close();
	});
	toolbar.add(closeBtn);
	ruleWin.add(toolbar);
	ruleWin.open({
		modal: true
		,animated: false
	});
}

/**
 * シェア・レビュー依頼を行う。
 */
function openShareAndReviewWindow() {
    var shareAndReviewDoneFlg = Ti.App.Properties.getBool("shareAndReviewDoneFlg");
    if (!shareAndReviewDoneFlg || shareAndReviewDoneFlg == false) {
        var dialog = Ti.UI.createAlertDialog({
            message: "アプリをお楽しみでしょうか？"
            ,buttonNames: ["いいえ", "はい"]
        });
        dialog.addEventListener('click', function(e) {
            if (e.index === 0) {
                //いいえの場合
            } else if (e.index == 1) {
                var ConfigWindow = require("/ui/handheld/ConfigWindow");
                var configWindow = new ConfigWindow();
                configWindow.tabBarHidden = true;
                Ti.App.tabGroup.activeTab.open(configWindow, {animated: true});
                Ti.App.Properties.setBool("shareAndReviewDoneFlg", true);
                //はいの場合
                var dialog = Ti.UI.createAlertDialog({
                    message: 'よろしければ、レビューまたはシェアをお願いします m(_ _)m',
                    ok: 'OK',
                    title: ''
                });
                dialog.show();                
            }
        });    
        dialog.show();
    }
}
