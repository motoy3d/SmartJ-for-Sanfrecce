/**
 * ニュース画面UI
 * loadFeed フィードを読み込む
 */
function NewsWindow(tabGroup) {
    var News = require("/model/News");
    var util = require("/util/util").util;
    var WebWindow = null;
    if(util.isiPhone()) {
        WebWindow = require("/ui/handheld/WebWindow");
    } else {
        WebWindow = require("/ui/handheld/WebWindowAndroid");
    }
    var ConfigWindow = require("/ui/handheld/ConfigWindow");
    var style = require("/util/style").style;
    var config = require("/config").config;
    var news = new News();
    var isOpeningNews = false;
 
    // 設定ボタン
    var configButton = Ti.UI.createButton({
        image: "/images/th.png"
    });
    var configButtonClicked = false;
    configButton.addEventListener('click', function() {
        if(configButtonClicked) {return;}
        try {
            configButtonClicked = true;
            var configWindow = new ConfigWindow();
            configWindow.tabBarHidden = true;
            tabGroup.activeTab.open(configWindow, {animated: true});
        } finally{
            configButtonClicked = false;
        }
    });
    // ウィンドウ
    var self = Ti.UI.createWindow({
        title: "ニュース"
        ,navBarHidden: false
        ,backgroundColor: 'black'
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
        ,rightNavButton: configButton
    });

    // 広告
    var ad = require('net.nend');
    var adViewContainer = Ti.UI.createView (style.news.adViewContainer);
    var adView;
    if(Ti.Platform.osname === 'android'){        
        // for Android
        // Icon Layout type. 
        adView = ad.createView ({
            spotId: config.nendSpotIdAndroid,
            apiKey: config.nendApiKeyAndroid,
            adType:'icon',
            orientation:'horizontal',
            width: '320dp',
            height: '75dp',
            top: '5dp'
        });
    } else {
        // for iPhone
        if(Ti.App.adType == 1) {//アイコン
            Ti.API.info('////アイコン広告////');
            adView = ad.createIconsView (style.news.adViewIPhoneIcon);
            adView.spotId = config.nendSpotIdIPhoneIcon;
            adView.apiKey = config.nendApiKeyIPhoneIcon;
        } else if(Ti.App.adType == 2) {//バナー
            Ti.API.info('////バナー広告////');
            adView = ad.createView (style.news.adViewIPhoneBanner);
            adView.spotId = config.nendSpotIdIPhoneBanner;
            adView.apiKey = config.nendApiKeyIPhoneBanner;
        }
    }
    // 2. Add Event Listener.
    // 受信成功通知
    adView.addEventListener('receive',function(e){
        //Ti.API.info('icon receive');
    });
    // 受信エラー通知
    adView.addEventListener('error',function(e){
        Ti.API.info('広告受信エラー');
        adViewContainer.setHeight(0);
        listView.setTop(0);
    });
    // クリック通知
    adView.addEventListener('click',function(e){
        Ti.API.info('広告クリック');
    }); 
    
    // 3. Add View
    adViewContainer.add(adView);
    self.add(adViewContainer);
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator();
    self.add(indicator);
    indicator.show();
    
    var lastRow = news.loadFeedSize;
    var visitedUrls = new Array();
    var lastSelectedRow = null;
    
    // ListViewのテンプレート
    var rowTemplate = {
        childTemplates : style.news.listViewTemplate,
        properties : {
            height : Ti.UI.SIZE
            ,backgroundColor: '#000'
        }
    };
    // Android用
    var refreshTemplate = {
        childTemplates : style.news.listViewRefreshTemplate,
        properties : {
            height : Ti.UI.SIZE
            ,backgroundColor: '#000'
        }
    };

    var listView = Ti.UI.createListView({
        templates : {
            'template' : rowTemplate
            ,'refreshTemplate': refreshTemplate
        }
        ,defaultItemTemplate : 'template'
        ,backgroundColor: '#000'
    });
    Ti.API.debug("★style.news.listView.backgroundColor=" + style.news.listView.backgroundColor);
    listView.applyProperties(style.news.listView);
    var sections = [];
    var dataSection = Ti.UI.createListSection();
    sections.push(dataSection);
    
    // アイテムクリックイベント
    listView.addEventListener('itemclick', function(e){
        Ti.API.info('アイテムクリックイベント：' + util.toString(e));
        if (e.itemIndex == undefined) {
            Ti.API.error('NO itemId in event. Check data. If data is right, file bug in JIRA.');
            return;
        }
        //Androidの場合、１行目はリロードボタン
        if(util.isAndroid() && e.itemIndex == 0) {
            if(e.bindId && e.bindId == 'refreshBtn') {
                loadFeed(news, "newerEntries");  //最新をロード
            }
            else if(e.bindId && e.bindId == 'configBtn') {
                if(configButtonClicked) {return;}
                try {
                    configButtonClicked = true;
                    var configWindow = new ConfigWindow();
                    configWindow.tabBarHidden = true;
                    tabGroup.activeTab.open(configWindow, {animated: true});
                } finally{
                    configButtonClicked = false;
                }
            }
            return;
        } else {
            //URLを開く
            openEntryWin(e.itemIndex);
        }
    });

    /**
     * ツイートのWebウィンドウを開く
     */
    function openEntryWin(itemIndex) {
        try {
            if(isOpeningNews) {
                Ti.API.info('ニュース詳細画面オープン処理中のためブロック');
                return;
            }
            isOpeningNews = true;
            var item = listView.sections[0].items[itemIndex];
            // 行背景色変更
            item.properties.backgroundColor = style.news.visitedBgColor;
            item.contentView.backgroundColor = style.news.visitedBgColor;
            listView.sections[0].updateItemAt(itemIndex, item);
            
            var webData = null;
            Ti.API.info("  ニュース選択。サイト名＝＝＝＝＝＝＝＝＝" + item.siteName + " : " + item.pageTitle);
            visitedUrls.push(item.link);
            lastSelectedRow = itemIndex;
            news.saveVisitedUrl(item.link);
            webData = {
                title : item.pageTitle
                ,titleFull : item.pageTitleFull
                ,siteName : item.fullSiteName
                ,link : item.link
                ,content : item.content
                ,image : item.image
                ,pubDate : item.pubDate
                ,toolbarVisible : true
            };
            var webWindow = new WebWindow(webData);
            //TODO 黒いスペースができてしまうTiのバグ
//            webWindow.tabBarHidden = true;
            tabGroup.activeTab.open(webWindow, {animated: true});
            Ti.App.Analytics.trackPageview('/newsDetail');
        } finally {
            isOpeningNews = false;
        }
    }
// ##########################################
// PullView
// ##########################################
    /**
     * PullHeaderをリセットする
     */
    function resetPullHeader(){
        actInd.hide();
        imageArrow.transform=Ti.UI.create2DMatrix();
        imageArrow.show();
        //TODO Android
        if (util.isiPhone()) {
            listView.setContentInsets({top:0}, {animated:true});
        }
    }
    function pullListener(e){
        if (e.active == false) {
            var unrotate = Ti.UI.create2DMatrix();
            imageArrow.animate({transform:unrotate, duration:180});
        } else {
            var rotate = Ti.UI.create2DMatrix().rotate(180);
            imageArrow.animate({transform:rotate, duration:180});
        }
    }
 
    function pullendListener(e){
        imageArrow.hide();
        actInd.show();
        //TODO Android
        if (util.isiPhone()) {
            listView.setContentInsets({top:80}, {animated:true});
        }
        setTimeout(function(){
            loadFeed(news, 'newerEntries');
        }, 2000);
    }
    // ヘッダ(pull to refreshの行)
    var listViewHeader = Ti.UI.createView({
        backgroundColor:'#000',
        width: Ti.UI.SIZE, height: 80
    });
    var border = Ti.UI.createView({
        backgroundColor:'#576c89',
        bottom:0,
        height:2
    });
    listViewHeader.add(border);
  
    var imageArrow = Ti.UI.createImageView({
        image: '/images/whiteArrow.png',
        /*left: 20,*/ bottom: 10,
        width: 23, height: 60
    });
    listViewHeader.add(imageArrow);
      
    var actInd = Ti.UI.createActivityIndicator({
        /*left:20,*/ bottom:13
    });
    listViewHeader.add(actInd);
    listView.pullView = listViewHeader; 
    listView.addEventListener('pull', pullListener);
    listView.addEventListener('pullend',pullendListener);

    // ##########################################
    // Dynamic Loading
    // ##########################################
    listView.addEventListener('marker', function(e) {
        loadFeed(news, 'olderEntries');
    });
    
    /**
     * フィードを取得して表示する
     * kind=firstTime/newerEntries/olderEntries
     */
    function loadFeed(news, kind) {
        if(util.isAndroid() && ("olderEntries" == kind || "newerEntries" == kind)) {
            indicator = Ti.UI.createActivityIndicator({style: Titanium.UI.ActivityIndicatorStyle.BIG});
            self.add(indicator);
            indicator.show();
            Ti.API.info('indicator.show()');
        }
//        var style = require("util/style").style;
//        var util = require("util/util").util;
        Ti.API.info(util.formatDatetime2(new Date()) + '  loadFeed started.................................');
        //alert('loadFeed : ' + news + ", kind=" + kind);
        //alert(news.loadNewsFeed);
        news.loadNewsFeed(
            kind, news.newest_item_timestamp, news.oldest_item_timestamp,
            { //callback
                success: function(rowsData, newest_item_timestamp, oldest_item_timestamp) {
                    try {
                        Ti.API.debug('■■■kind = ' + kind);
                        Ti.API.debug('■■■newest_item_timestamp = ' + newest_item_timestamp);
                        Ti.API.debug('■■■oldest_item_timestamp   = ' + oldest_item_timestamp);
                        
                        // 読み込み中Row削除
                        //Ti.API.info("rowsData■" + rowsData);
                        // 初回ロード時
                        if("firstTime" == kind) {
                            if(Ti.App.adType == 1 || Ti.Platform.osname === 'android') {//アイコン
                                Ti.API.info('★アイコン広告');
                                adViewContainer.height = 80;
                                adView.height = 75;
                                listView.top = 80;
                            } else if(Ti.App.adType == 2){//バナー
                                Ti.API.info('★バナー広告');
                                adViewContainer.height = 50;
                                adView.height = 50;
                                listView.top = 50;
                            }
                            if(rowsData) {
                                if(util.isAndroid()) {   // リロードボタンの行を１番目に挿入
                                     rowsData.unshift(
                                        {
                                            refreshBtn: {} 
                                            ,configBtn: {} 
                                            ,properties: {
                                                accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
                                            }
                                            ,template: 'refreshTemplate'
                                        }  
                                     );
                                }
                                dataSection.setItems(rowsData);
                                listView.sections = sections;
                                listView.setMarker({sectionIndex: 0, itemIndex: (rowsData.length - 1) });
                                self.add(listView);
                                news.newest_item_timestamp = newest_item_timestamp;
                                news.oldest_item_timestamp = oldest_item_timestamp;
                                indicator.hide();
                            }
                        }
                        // 2回目以降の追加ロード時
                        else if("olderEntries" == kind) {
                            if(rowsData) {
                                Ti.API.info(new Date() + ' appendItems start');
                                dataSection.appendItems(rowsData);
                                Ti.API.info(new Date() + ' appendItems end');
                            }
                            listView.setMarker({sectionIndex: 0, itemIndex: (dataSection.items.length - 1) });
                        }
                        // 最新データロード時
                        else if("newerEntries" == kind) {
                            if(rowsData) {
                                if(!listView.sections || listView.sections.length == 0) {    //初回起動時にネットワークエラーが出た場合など
                                    listView.sections = sections;
                                }
                                Ti.API.debug('最新データ読み込み  件数＝' + rowsData.length);
                                var appendIdx = util.isiPhone()? 0 : 1;
                                dataSection.insertItemsAt(appendIdx, rowsData);
                            }
                        }
                        else {
                            Ti.API.error('NewsWindow#loadFeedに渡すkindが不正です。kind=' + kind);
                        }
                    } finally {
                        if(indicator){indicator.hide();}
                        resetPullHeader();
                        Ti.API.info(util.formatDatetime2(new Date()) + '  loadFeed finished.................................');
                    }
                },
                fail: function(message) {
                    if(indicator){indicator.hide();}
                    var dialog = Ti.UI.createAlertDialog({
                        message: message,
                        buttonNames: ['OK']
                    });
                    dialog.show();
                    resetPullHeader();
                }
            }
        );
    }
    loadFeed(news, 'firstTime');
    
    // self.addEventListener("open", function(e){
        // Ti.API.info('ウィンドウオープン');
        // Ti.Android.currentActivity.actionBar.title = "スマートJ for アルビレックス";
        // Ti.Android.currentActivity.actionBar.hide();
    // });
    return self;
};
module.exports = NewsWindow;
