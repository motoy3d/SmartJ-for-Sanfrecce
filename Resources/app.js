/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

// This is a single context application with mutliple windows in a stack
(function() {
    var config = require("/config").config;
    var util = require("util/util").util;
    var style = require("util/style").style;
    var XHR = require("util/xhr");

	startAnalytics();
	initDB();
	
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		model = Ti.Platform.model,
		name = Ti.Platform.name,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth,
		density = Ti.Platform.displayCaps.density,
        logicalDensityFactor = Ti.Platform.displayCaps.logicalDensityFactor,
		dpi = Ti.Platform.displayCaps.dpi,
		xdpi = Ti.Platform.displayCaps.xdpi,
		ydpi = Ti.Platform.displayCaps.ydpi;
	Ti.API.info('★★osname=' + osname);
	Ti.API.info('★★version=' + version);
    Ti.API.info('★★name=' + name);
    Ti.API.info('★★model=' + model);
	Ti.API.info('★★width/height=' + width + "/" + height);
	Ti.API.info('★★density=' + density);
    Ti.API.info('★★logicalDensityFactor=' + logicalDensityFactor);
	Ti.API.info('★★dpi=' + dpi);
    Ti.API.info('★★xdpi=' + xdpi);
    Ti.API.info('★★ydpi=' + ydpi);
    Ti.API.info('☆☆dpi from module=' + util.getDpi());
    Ti.App.Analytics.trackPageview("/startApp?m=" + model + "&v=" + version/* + "&wh=" + width + "x" + height*/);	

	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	if(osname == "iphone") {
        Ti.UI.iPhone.statusBarStyle = Ti.UI.iPhone.StatusBar.OPAQUE_BLACK;
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
    var confUrl = config.messageUrl + "&os=" + osname + "&version=" + version;
    Ti.API.info(new Date() + ' メッセージURL：' + confUrl);
    xhr.get(confUrl, onSuccessCallback, onErrorCallback);
    function onSuccessCallback(e) {
        Ti.API.info('メッセージデータ:' + e.data);
        if(e.data) {
            var json = JSON.parse(e.data);
            if(json && json[0] && json[0].adType){
                Ti.App.adType = json[0].adType;    //広告タイプ(1:アイコン、2:バナー)
            }
            if(json && json[0] && json[0].message){
                message = json[0].message;
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
            tabGroup.open({transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});      
        } else {
            tabGroup.open();
        }
        // メッセージがある場合は表示
        if(message) {
            var dialog = Ti.UI.createAlertDialog({title: 'お知らせ', message: message});
            dialog.show();
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
