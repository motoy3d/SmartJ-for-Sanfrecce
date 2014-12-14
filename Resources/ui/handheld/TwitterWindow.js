/**
 * Twitter画面UI
 * @tabGroup 親タブグループ
 * @target searchTweets or playerTweets
 */
function TwitterWindow(tabGroup, target) {
    var Twitter = require("/model/Twitter");
    var WebWindow = require("/ui/handheld/WebWindow");    
    var util = require("/util/util").util;
    var style = require("/util/style").style;
    var twitter = new Twitter(target);
    var initLoaded = false;

    // ウィンドウ
    var self = Ti.UI.createWindow({
        title: "twitter"
        ,navBarHidden: false
        ,backgroundColor: 'black'
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
//        ,rightNavButton: refreshButton
    });
    if (util.isAndroid()) {
        self.navBarHidden = true;
    }
    
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator({
        style: util.isiPhone()? Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN : Ti.UI.ActivityIndicatorStyle.BIG
    });
    self.add(indicator);
    
    if(util.isiOS7Plus()) {
        // iOS7で、全てのタブのwindow openイベントがアプリ起動時に発火してしまうのでfocusイベントに変更。
        self.addEventListener('focus', function(){
            if(!initLoaded) {
                Ti.API.info('-----------------------TwitterWindow focus event');
                load("firstTime");
                initLoaded = true;
            }
        });
    } else {
        self.addEventListener('open', function(){
            Ti.API.info('-----------------------TwitterWindow open event');
            load("firstTime");
        });        
    }
    
    // ListViewのテンプレート
    var rowTemplate = {
        childTemplates : style.twitter.listViewTemplate,
        properties : {
            height : Ti.UI.SIZE
            ,backgroundColor: '#000'
        }
    };
    // Android用
    var refreshTemplate = {
        childTemplates : style.twitter.listViewRefreshTemplate,
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
    Ti.API.debug("★style.twitter.listView.backgroundColor=" + style.twitter.listView.backgroundColor);
    listView.applyProperties(style.twitter.listView);
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
                load("newer");  //最新をロード
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
        var item = listView.sections[0].items[itemIndex];

        if(util.isAndroid()) {
            var item = listView.sections[0].items[itemIndex];
            item.content.color = "#38e";
            listView.sections[0].updateItemAt(itemIndex, item);
        }
        var win = Ti.UI.createWindow(style.twitter.webWindow);
        //win.orientationModes = [Ti.UI.PORTRAIT];
        if (util.isAndroid()) {
            win.tabBarHidden = true;
        }
        var entryData = listView.sections[0].items[itemIndex];
        var web = Ti.UI.createWebView({
            url: entryData.url
        });
        if (util.isAndroid()) {
            web.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
        }
        Ti.API.info('web=' + web);
        win.add(web);
        var webIndicator = Ti.UI.createActivityIndicator({
            style: util.isiPhone()? Ti.UI.iPhone.ActivityIndicatorStyle.DARK : Ti.UI.ActivityIndicatorStyle.BIG
        });
        win.add(webIndicator);
        webIndicator.show();
        web.addEventListener('load', function(e){
//            Ti.API.info('loadイベント');
            if(util.isAndroid()) {
                web.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
            }
            setTimeout(function(){webIndicator.hide();}, 700);   //インジケータが消えるのが早過ぎるので0.5秒待ってから消す
            if(util.isAndroid()) {
//                Ti.API.info('###色を戻す');
                var item = listView.sections[0].items[itemIndex];
                item.content.color = "white";
                listView.sections[0].updateItemAt(itemIndex, item);
            }
        });
        tabGroup.activeTab.open(win, {animated: true});
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
            load('newer');
        }, 2000);
    }
    // ヘッダ(pull to refreshの行)
    var tableHeader = Ti.UI.createView({
        backgroundColor:'#000',
        width: Ti.UI.SIZE, height: 80
    });
    var border = Ti.UI.createView({
        backgroundColor:'#576c89',
        bottom:0,
        height:2
    });
    tableHeader.add(border);
  
    var imageArrow = Ti.UI.createImageView({
        image: '/images/whiteArrow.png',
        /*left: 20,*/ bottom: 10,
        width: 23, height: 60
    });
    tableHeader.add(imageArrow);
      
    var actInd = Ti.UI.createActivityIndicator({
        /*left:20,*/ bottom:13
    });
    tableHeader.add(actInd);
    listView.pullView = tableHeader; 
    listView.addEventListener('pull', pullListener);
    listView.addEventListener('pullend',pullendListener);

    // ##########################################
    // Dynamic Loading
    // ##########################################
    listView.addEventListener('marker', function(e) {
        load('older');
    });
    /**
     * エントリを取得して表示する
     */
    function load(kind) {
        if(util.isAndroid() && ("older" == kind || "newer" == kind)) {
            indicator = Ti.UI.createActivityIndicator({style: Titanium.UI.ActivityIndicatorStyle.BIG});
            self.add(indicator);
            Ti.API.info('indicator.show()');
        }
        indicator.show();
        Ti.API.info(util.formatDatetime2(new Date()) + '  loadFeed started.................................');
        //alert('load : ' + twitter + ", kind=" + kind);
        twitter.loadTweets(
            kind, 
            { //callback
                success: function(rowsData) {
                    try {
                        Ti.API.debug('■■■kind = ' + kind);
                        Ti.API.debug('■■■newestId = ' + twitter.newestId);
                        Ti.API.debug('■■■oldestId   = ' + twitter.oldestId);
                        
                        // 読み込み中Row削除
                        //Ti.API.info("rowsData■" + rowsData);
                        // 初回ロード時
                        if("firstTime" == kind) {
                            if(rowsData) {
                                Ti.API.info("rowsData = " + util.toString(rowsData[0]));
                                Ti.API.info("content = " + rowsData[0].postImage);
                                if(util.isAndroid()) {   // リロードボタンの行を１番目に挿入
                                     rowsData.unshift(
                                        {
                                            refreshBtn: {} 
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
                            }
                        }
                        // 2回目以降の追加ロード時
                        else if("older" == kind) {
                            if(rowsData) {
                                Ti.API.info(new Date() + ' appendItems start');
                                dataSection.appendItems(rowsData);
                                Ti.API.info(new Date() + ' appendItems end');
                            }
                            listView.setMarker({sectionIndex: 0, itemIndex: (dataSection.items.length - 1) });
                        }
                        // 最新データロード時
                        else if("newer" == kind) {
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
                        Ti.API.info('>>>>>>>>>>>>>>>>>>>>>>>>> loadメソッドfinally. indicator.hide()');
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
    return self;
}
module.exports = TwitterWindow;
