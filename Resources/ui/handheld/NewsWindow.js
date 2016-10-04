/**
 * ニュース画面UI
 * loadFeed フィードを読み込む
 * @tabGroup
 * @teamId
 * @teamName
 */
function NewsWindow(tabGroup, teamId, teamName) {
    var News = require("/model/News");
    var Standings = require("/model/Standings");
    var util = require("/util/util").util;
    var WebWindow = null;
    if(util.isiOS()) {
        WebWindow = require("/ui/handheld/WebWindow");
    } else {
        WebWindow = require("/ui/handheld/WebWindowAndroid");
    }
    var ConfigWindow = require("/ui/handheld/ConfigWindow");
    var style = require("/util/style").style;
    var config = require("/config").config;
    var news = new News(teamId);
    var isOpeningNews = false;
 
    // 設定ボタン
    var configButton = Ti.UI.createButton({
        image: "/images/th.png"
    });
    var configButtonClicked = false;		//ダブルタップ防止フラグ
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
    
    // 他チーム情報ボタン
    var otherTeamButton = Ti.UI.createButton({
        image: "/images/zoom.png"
    });
    var otherTeamButtonClicked = false;		//ダブルタップ防止フラグ
    otherTeamButton.addEventListener('click', function() {
        if(otherTeamButtonClicked) {return;}
        try {
            otherTeamButtonClicked = true;
            openOtherTeamWin();
        } finally{
            otherTeamButtonClicked = false;
        }
    });

    // ウィンドウ
    var self = Ti.UI.createWindow({
        title: (teamName? teamName + " " : "") + "ニュース"
        ,navBarHidden: false
        ,backgroundColor: style.common.backgroundColor
        ,navTintColor: style.common.navTintColor
        ,titleAttributes: {
            color: style.common.navTintColor
        }
    });
    if (teamId == config.teamId) {	//自分のチームの時
        self.rightNavButton = configButton;
        self.leftNavButton = otherTeamButton;
        self.barColor = style.common.barColor;
    } else {
    	self.barColor = "#ccc";
    	self.navTintColor = "black";
        self.titleAttributes = {color: "black"};
    }

    // 広告
    var ad = require('net.nend');
    var adViewContainer = Ti.UI.createView (style.news.adViewContainer);
    var adView;
    if(Ti.Platform.osname === 'android'){        
        // for Android
        // Icon Layout type. 
        if(Ti.App.adType == 1) {//アイコン
            adView = ad.createView ({
                spotId: config.nendSpotIdAndroid,
                apiKey: config.nendApiKeyAndroid,
                adType:'icon',
                orientation:'horizontal',
                width: 320,
                height: 75,
                top: 5,
                iconCount: 4
            });
        } else if(Ti.App.adType == 2) {    //バナー
            adView = ad.createView ({
                spotId: config.nendSpotIdAndroidBanner,
                apiKey: config.nendApiKeyAndroidBanner,
                top: 0,
                isAdjust: true
            });
        }
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
    if (adView) {
        // 2. Add Event Listener.
        // 受信成功通知
        adView.addEventListener('receive',function(e){
            //Ti.API.info('icon receive');
        });
        // 受信エラー通知
        adView.addEventListener('error',function(e){
            Ti.API.info('広告受信エラー');
            adViewContainer.setHeight(0);
            adView.setHeight(0);
            listView.setTop(0);
        });
        // クリック通知
        adView.addEventListener('click',function(e){
            Ti.API.info('広告クリック');
        }); 
        
        // 3. Add View
        if (util.isAndroid()) {
            self.add(adView);
        } else {
            adViewContainer.add(adView);
            self.add(adViewContainer);
        }
    }
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator({
    	style: util.isiOS()? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.ActivityIndicatorStyle.BIG
    });
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
            ,backgroundColor: style.common.backgroundColor
        }
    };
    // Android用
    var refreshTemplate = {
        childTemplates : style.news.listViewRefreshTemplate,
        properties : {
            height : Ti.UI.SIZE
            ,backgroundColor: style.common.backgroundColor
        }
    };

    var listView = Ti.UI.createListView({
        templates : {
            'template' : rowTemplate
            ,'refreshTemplate': refreshTemplate
        }
        ,defaultItemTemplate : 'template'
        ,backgroundColor: style.common.backgroundColor
    });
    Ti.API.debug("★　style.news.listView.backgroundColor=" + style.news.listView.backgroundColor);
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
                ,navBarHidden : true
                ,toolbarVisible : true
                ,isBlockReportEnable : true
            };

            var webWindow = new WebWindow(webData,
				{ //ブロックサイトをリストから削除するcallback
	                removeBlockedSite: function(site) {
	                	//alert("removeBlockedSite = " + site);
	                	var items = listView.sections[0].items;
	                	Ti.API.info('items.length 1 = ' + items.length);
	                	for(var i=0; i<items.length; i++) {
	                		//Ti.API.info(i + ' 🌟リンク ' + items[i].link);
	                		if (items[i].link.indexOf(site) == 0) {
		                		Ti.API.info(i + ' 削除 ' + items[i].link);
	                			listView.sections[0].deleteItemsAt(i, 1);
	                			i--;
	                			items = listView.sections[0].items;
	                			//Ti.API.info('items.length 2 = ' + items.length);
	                		}
	                	}
	                }
	            }            	
        	);
            //TODO 黒いスペースができてしまうTiのバグ https://jira.appcelerator.org/browse/TIMOB-16069
            //webWindow.tabBarHidden = true;
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
        if (util.isiOS()) {
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
        if (util.isiOS()) {
            listView.setContentInsets({top:80}, {animated:true});
        }
        setTimeout(function(){
            loadFeed(news, 'newerEntries');
        }, 2000);
    }
    // ヘッダ(pull to refreshの行)
    var listViewHeader = Ti.UI.createView({
        backgroundColor: style.common.backgroundColor,
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
        ,style: util.isiOS()? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.ActivityIndicatorStyle.BIG
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
            indicator = Ti.UI.createActivityIndicator({
            	style: util.isiOS()? Ti.UI.ActivityIndicatorStyle.DARK : Ti.UI.ActivityIndicatorStyle.BIG
        	});
            self.add(indicator);
            indicator.show();
            Ti.API.info('indicator.show()');
        }
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
                            if(Ti.App.adType == 1) {//アイコン
                                //Ti.API.info('★アイコン広告');
                                adViewContainer.height = 80;
                                adView.height = 75;
                                listView.top = 80;
                            } else if(Ti.App.adType == 2){//バナー
                                //Ti.API.info('★バナー広告');
                                if (util.isAndroid()) {
                                    listView.top = 70; // 元は50
                                } else {
                                    adView.height = 50;
                                    adViewContainer.height = 50;
                                    listView.top = 50;
                                }
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
                                Ti.API.info('★　rowsData = ' + rowsData);
                                Ti.API.info('★　dataSection = ' + dataSection);
                                Ti.API.info('★　listView = ' + listView);
                                Ti.API.info('★　sections = ' + sections + " (" + sections.length + ")");
                                Ti.API.info('★　sections[0] = ' + sections[0]);
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
                                var appendIdx = util.isiOS()? 0 : 1;
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

    /**
     * 他チーム情報ウィンドウを開く
     */
    function openOtherTeamWin() {
        indicator.show();
        //ウィンドウ
        var otherTeamWin = Ti.UI.createWindow({
            width: "90%"
            ,height: "94%"
            ,backgroundColor: "white"
            ,modal: true
        });
        //タイトル
        var titleBar = Ti.UI.createLabel({
            text: " 他チームニュース"
            ,width: Ti.UI.FILL
            ,top: 0
            ,height: 50
            ,backgroundColor: "#efefef"
        });
        if (util.isAndroid()) {
            titleBar.color = "black";
        }
        //他チームテーブル
        var teamTable = Ti.UI.createTableView({
            width: Ti.UI.FILL
            ,height: Ti.UI.FILL
            ,top: 50
            ,bottom: 40
            ,minRowHeight: 44
            ,separatorColor: "#efefef"
        });
        //順位表データからチーム一覧を取得
        var standings = new Standings("J", Ti.App.currentStage);
        standings.load("seq", {
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        if (config.teamId != data.teamId) {
	                        rows.push({
	                            title: "　" + data.teamFull
	                            ,teamId: data.teamId
	                            ,teamName: data.team
	                            ,color: "black"
	                        });
                        }
                    }
                    teamTable.setData(rows);
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    indicator.hide();
                    // isLoading = false;
                }
            },
            fail: function(message) {
                indicator.hide();
                isLoading = false;
                var dialog = Ti.UI.createAlertDialog({
                    message: message,
                    buttonNames: ['OK']
                });
                dialog.show();
            }
        });
        //チーム選択時
        teamTable.addEventListener("click", function(e){
            Ti.API.info('他チーム選択：' + e.rowData.teamId);
            otherTeamWin.close();
            var otherTeamNewsWin = new NewsWindow(tabGroup, e.rowData.teamId, e.rowData.teamName);
            tabGroup.activeTab.open(otherTeamNewsWin, {animated: true});
        });
        //閉じるボタン
        var closeBtn = Ti.UI.createButton({
            title: "閉じる"
            ,width: 140
            ,height: 40
            ,bottom: 0
        });
        if (util.isAndroid()) {
            closeBtn.color = "black";
        }
        closeBtn.addEventListener("click", function(e){
            otherTeamWin.close();
        });
        otherTeamWin.add(titleBar);
        otherTeamWin.add(teamTable);
        otherTeamWin.add(closeBtn);
        if (util.isiOS()) {
	        otherTeamWin.open({
	        	modal : true
	        	,modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE
	        });
	    } else {
	        otherTeamWin.open({
	        	modal : true
	        	,activityEnterAnimation: Ti.Android.R.anim.fade_in
	        	,activityExitAnimation: Ti.Android.R.anim.fade_out
	        });
	    }
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
