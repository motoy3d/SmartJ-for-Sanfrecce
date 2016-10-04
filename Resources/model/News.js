var config = require("/config").config;
var util = require("util/util").util;
var style = require("util/style").style;
var newsSource = require("model/newsSource");
var XHR = require("util/xhr");
var LOAD_FEED_SIZE = config.newsEntriesPerPage;
var visitedUrlList = new Array();
var rowIdx = 0;

/**
 * ニュース情報
 */
function News(teamId) {
	var feedUrlBase = config.feedUrlBase + "?teamId=" + teamId + "&count=";
    var self = {};
    self.newest_item_timestamp = 0; // 最新データを読み込む場合のパラメータ（最新フィードのタイムスタンプ）
    self.oldest_item_timestamp = 0; // 古いデータを読み込む場合のパラメータ（最古フィードのタイムスタンプ）
    self.updating = false;  // スクロール時のテーブルビュー更新
    self.visitedUrls = new Array();
    self.loadFeedSize = LOAD_FEED_SIZE;
    
    self.loadNewsFeed = loadNewsFeed;   //function
    self.saveVisitedUrl = saveVisitedUrl;  //function
    
    visitedUrlList = getVisitedUrlList();
    self.visitedUrlList = visitedUrlList;
    var blockSiteList = getBlockedUrlList();

//    Ti.API.info('styleから画像width取得=' + style.news.listViewTemplate[0].childTemplates[0].properties.width);
    //画像のwidth既定値
    var dispImgWidth = style.news.listViewTemplate[0].childTemplates[0].properties.width;
    
    /**
     * フィードを読み込んで表示する
     * @kind ("firstTime" or "olderEntries" or "newerEntries")
     * @continuation kind=olderEntriesの場合のみ使用。Google Reader用「次へ」用パラメータ 
     * ＠newest_item_timestamp kind=newerEntriesの場合のみ使用。最新データ取得時のstart_time
     * @callback
     */
    function loadNewsFeed(kind, minItemDatetime, maxItemDatetime, callback) {
        Ti.API.info('---------------------------------------------------------------------');
        Ti.API.info(util.formatDatetime() + '  ニュース読み込み kind=' + kind);
        Ti.API.info('---------------------------------------------------------------------');
        // オンラインチェック
        if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
        }
        Ti.App.Analytics.trackPageview('/newsList');
    
        // 古いデータ・最新データの読み込み条件
        var condition = "";
        if('olderEntries' == kind) {
            condition = "&max=" + maxItemDatetime;
        } else if('newerEntries' == kind) {
            condition = "&min=" + minItemDatetime;
        }
        if("firstTime" != kind) {
    //        LOAD_FEED_SIZE = 10;    //初回ロード以外の場合に件数を少なくすることで高速化
        }
        var feedUrl = feedUrlBase + LOAD_FEED_SIZE + condition;
        // フィードを取得
        Ti.API.info("★★★News読み込み " + feedUrl);
        var xhr = new XHR();
        xhr.get(feedUrl, onSuccessCallback, onErrorCallback);
        function onSuccessCallback(e) {
            if(e.data == null) {
                Ti.API.info('e.data = null');
                callback.success(null, null, null);
                return;
            }
            try {
                var dataList = JSON.parse(e.data);
                if(dataList[0] && "no data" == dataList[0].json) {
                    Ti.API.info('データなし');
                    callback.success(null, null, null);
                    return;
                }
                //Ti.API.info("dataList■" + dataList);
                var rowsData = null;
                var newest_item_timestamp = 0;
                var oldest_item_timestamp = 0;
                if(dataList.map) {
                    rowsData = dataList.map(
                        function(item) {
                            var row = createNewsRow(item);
                            if (row == null) {
                            	return null;	//ブロック
                            }
                            var pubDateNum = item.published_date_num;
                            if(newest_item_timestamp < pubDateNum) {
                                newest_item_timestamp = pubDateNum;
                            }
                            if(oldest_item_timestamp == 0 || pubDateNum < oldest_item_timestamp) {
                                oldest_item_timestamp = pubDateNum;
                            }
                            return (row);
                        }
                    );
                    if(self.newest_item_timestamp < newest_item_timestamp) {
                        self.newest_item_timestamp = newest_item_timestamp;
                    }
                    if(oldest_item_timestamp < self.oldest_item_timestamp) {
                        self.oldest_item_timestamp = oldest_item_timestamp;
                    }
                }
                Ti.API.info("読み込み終了");
                var rowsData2 = new Array();
                var rowsData2Idx = 0;
                for (var i=0; i<rowsData.length; i++) {
                	if (rowsData[i]) {
	                	rowsData2[rowsData2Idx] = rowsData[i];
	                	rowsData2Idx++;
	                }
                }
                callback.success(rowsData2, newest_item_timestamp, oldest_item_timestamp);
            } catch(ex) {
                Ti.API.error("loadNewsFeedエラー：" + ex);
                callback.fail('読み込みに失敗しました');
            }
        };
        function onErrorCallback(e) {
            Ti.API.error(e);
        }
    }
    
    /**
     * rowを生成する
     */
    function createNewsRow(item) {
        //Ti.API.info("アイテム=" + item);
        //for(var v in item) {
            //Ti.API.info("\t" + v + ":" + item[v]);
        //}
        rowIdx++;
        
        // 本文
        var content = "";
        if(item.content) {
            content = item.content;
        }
        else if(item.summary) {
            content = item.summary;
        }
        // 画像
        var hasImage = false;
        var imgUrl = item.image_url;
        var imgWidth = "";
        var imgHeight = "";
        // タイトルラベル
        var titleLabel = Ti.UI.createLabel(style.news.titleLabel);
        var itemTitleFull = util.deleteUnnecessaryText(item.entry_title);
        //Ti.API.info('itemTitleFull=' + itemTitleFull + "   entry_tiel=" + item.entry_title);
        var itemTitle = itemTitleFull;
        if(itemTitleFull.length > 50) {
            itemTitle = itemTitleFull.substring(0, 50) + "...";
        }
        //Ti.API.info(rowIdx + ' ' + itemTitle);
        titleLabel.text = itemTitle;
    //  Ti.API.info("最適化後：itemTitle====" + itemTitle);
        // 更新日時
        var pubDate = parseDate(item.published_date);
        //Ti.API.info("pubDate=====" + pubDate);
        var minutes = pubDate.getMinutes();
        if(minutes < 10) {
            minutes = "0" + minutes;
        }
        var pubDateText = (pubDate.getMonth() + 1) + "/" + pubDate.getDate() 
            + " " + pubDate.getHours() + ":" + minutes;
        
        // サイト名+更新日時ラベル
        var link = "";
        //Ti.API.info("★" + idobj[oid].toString());
        link = item.entry_url;
        
        // 既読確認
        var isVisited = util.contains(visitedUrlList, link);
        // ブロック確認
        var isBlocked = util.containsStartsWith(blockSiteList, link);
        //Ti.API.info("ブロックサイトリスト：" + util.toString(blockSiteList));
        Ti.API.info('link=' + link);
        //Ti.API.info('ブロック？ ' + isBlocked);
        if (isBlocked) {
        	return null;
        }
        // サイト名
        var fullSiteName = item.site_name;
        if(fullSiteName.toString().indexOf("Google") == 0) {
            fullSiteName = "";
        }
        var siteName = newsSource.optimizeSiteName(item.site_name);
    //    Ti.API.info("siteName1====" + siteName + ",pubDate=" + pubDateText + ", link=" + link);
        if('' == siteName) {
            siteName = newsSource.getSiteName(link);
            fullSiteName = siteName;
        }
        //Ti.API.info(rowIdx + ". siteName2====" + siteName);
        var siteNameLabel = Ti.UI.createLabel(style.news.siteNameLabel);
        siteNameLabel.text = siteName + "   " + pubDateText;
        //Ti.API.info('★siteNameLabel.text==' + siteNameLabel.text);
        if (imgUrl) {
            var orgImgWidth = item.image_width;
            var orgImgHeight = item.image_height;
            var magnification =  dispImgWidth / orgImgWidth; //幅の倍率
            var dispImgHeight = Math.round(orgImgHeight * magnification);
            Ti.API.info('画像：' + imgUrl + " (org_w=" + orgImgWidth + ", org_h=" + orgImgHeight + ") "
                + " (w=" + dispImgWidth + ", h=" + dispImgHeight + ") / " + itemTitle);
        }
        var data = {
            url: link
            ,contentView: {
                backgroundColor: isVisited? style.news.visitedBgColor : style.common.backgroundColor
            }
            ,image: {
                image: imgUrl
                ,width: imgUrl? dispImgWidth : 0
                ,height: imgUrl? dispImgHeight : 0
            }
            ,title: {
            	// ブロックテスト
                //text: isBlocked? "（ブロック）" + itemTitle : itemTitle
                text: itemTitle
                ,left: imgUrl? dispImgWidth + 10 : 6
                , height: imgUrl? dispImgHeight : Ti.UI.SIZE
            }
            ,siteNameAndDatetime: {text: siteName + "   " + pubDateText}
            ,properties: {backgroundColor: isVisited? style.news.visitedBgColor : style.common.backgroundColor}
            
            ,fullSiteName: fullSiteName
            ,siteName: siteName
            ,pageTitle: itemTitle
            ,pageTitleFull: itemTitleFull
            ,link: link
            ,content: content
            ,pubDate: pubDateText
    
    // 選択時背景色がAndroidで効かない
    //                            ,selectedBackgroundColor: '#444'
    //,properties: {selectedBackgroundColor: '#444'}
        };
        return data;
    }
    
    /**
     *  日付をパースして返す
     */
    function parseDate(str){// str==yyyy-mm-ddThh:mm:ssZ
        //strdate==YYYY/mm/dd hh:mm:ss
        //var strDate = str.split('\+')[0].replace('T',' ').replace('-','\/').replace('-','\/').replace('Z','');
        var date = new Date(str);
        var time = date.getTime()/* + 32400000*/;
        date.setTime(time);
        return date;
    };
    
    /**
     * DBに既読URLを保存する
     */
    function saveVisitedUrl(url) {
        var date = util.formatDate();
        var db = Ti.Database.open(config.dbName);
        try {
            db.execute('INSERT INTO visitedUrl(url, date) VALUES(?, ?)', url, date);
        } finally{
            db.close();
        }
    }
    
    /**
     * DBから既読URLリストを返す
     */
    function getVisitedUrlList() {
        Ti.API.info('■getVisitedUrlList');
        var db = Ti.Database.open(config.dbName);
        var urlList = new Array();
        try {
            var rows = db.execute('SELECT url, date FROM visitedUrl');
            while (rows.isValidRow()) {
                urlList.push(rows.field(0));
                //Ti.API.info('既読　######## ' + rows.field(1) + " : " + rows.field(0));
                rows.next();
            }
        } finally{
            db.close();
        }
        return urlList;
    }

    /**
     * DBからブロックURLリストを返す
     */
    function getBlockedUrlList() {
        Ti.API.info('■getBlockedUrlList');
        var db = Ti.Database.open(config.dbName);
        var urlList = new Array();
        try {
            var rows = db.execute('SELECT url, date FROM blockSite');
            while (rows.isValidRow()) {
                urlList.push(rows.field(0));
                //Ti.API.info('ブロックサイト　######## ' + rows.field(0) + " : " + rows.field(1));
                rows.next();
            }
        } finally{
            db.close();
        }
        return urlList;
    }

    return self;
};

module.exports = News;
