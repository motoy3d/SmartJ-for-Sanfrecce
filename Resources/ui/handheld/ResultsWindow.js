/**
 * 日程・結果画面UI
 */
function ResultsWindow(tabGroup) {
    var util = require("util/util").util;
	var Results = require("model/Results");
    var WebWindow = require(util.isiPhone()? "/ui/handheld/WebWindow" : "/ui/handheld/WebWindowAndroid");
	var YoutubeWindow = require("ui/handheld/YoutubeWindow");
	var style = require("util/style").style;
	var initLoaded = false;

    // 更新ボタン
    var refreshButton = Ti.UI.createButton();
    if(util.isiPhone()) {
        refreshButton.systemButton = Ti.UI.iPhone.SystemButton.REFRESH;
    } else {
        refreshButton.title = "更新";
    }
	var self = Ti.UI.createWindow({
		title: "日程・結果"
        ,navBarHidden: false
        ,backgroundColor: 'black'
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
        ,rightNavButton: refreshButton
	});
	self.loadDetailHtml = loadDetailHtml;	//function
	self.searchMovie = searchMovie;	//function
    // テーブル
    var tableView = Ti.UI.createTableView(style.results.table); 
    var results = new Results(self);

    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        self.remove(tableView);
        indicator.show();
        loadResults();
    });
	// インジケータ
    var indicator = Ti.UI.createActivityIndicator({
        style: util.isiPhone()? Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN : Ti.UI.ActivityIndicatorStyle.BIG
    });
	self.add(indicator);
	/**
	 * クラブ公式サイトの試合日程htmlを読み込んで表示する
	 */
	function loadResults() {
        Ti.API.info(">>>>>>>>> loadResults start");
		indicator.show();
		// オンラインチェック
		if(!Ti.Network.online) {
			indicator.hide();
			util.openOfflineMsgDialog();
			return;
		}
		Ti.API.info(">>>>>>>>> results=" + results);
		results.load({
			/* 成功時処理 */
			success: function(rowsData) {
				try {
				    var rowIdx = 0;
				    for(i=0; i<rowsData.length; i++) {
				        if(!rowsData[i]) {
				            continue; // 無観客試合があるため
				        }
				        else if(rowsData[i].detailUrl && rowsData[i].detailUrl != "") {
				            rowIdx = i;
				        } else {
				            break;
				        }
				    }
					self.add(tableView);
					tableView.setData(rowsData);                    if(3 < rowIdx) {
                        Ti.API.info('rowIdx=' + rowIdx);
                        //最新試合が真ん中に来るように
                        if(util.isAndroid()) {
                            tableView.scrollToIndex(rowIdx - 1);    
                        } else {
                            tableView.scrollToIndex(rowIdx + 1);    
                        }
                    }
				} catch(e) {
				    Ti.API.debug("エラー");
					Ti.API.error(e);
				} finally {
				    Ti.API.debug("インジケータ hide");
					indicator.hide();
				}
			},
			/* 失敗時処理 */
            fail: function(message) {
                indicator.hide();
                var dialog = Ti.UI.createAlertDialog({
                    message: message,
                    buttonNames: ['OK']
                });
				dialog.show();
			}
		});
	}

	/**
	 * 試合詳細ページをWebViewで表示する (Results.jsから呼ぶ)
	 */
	function loadDetailHtml(detailUrl) {
		Ti.API.info("loadDetailHtml----------");
		var webData = {
			title : "試合詳細"
			,link : detailUrl
			,toolbarVisible: true
		};
		var webWindow = new WebWindow(webData);
        tabGroup.activeTab.open(webWindow, {animated: true});
	}

	/**
	 * 動画検索結果を表示する (Results.jsから呼ぶ)
	 */
	function searchMovie(searchCond) {
        Ti.API.info("searchMovie----------k1 =  " + searchCond.key1 + "¥n k2 =  " + searchCond.key2);
        var youtubeWindow = new YoutubeWindow(searchCond);
        tabGroup.activeTab.open(youtubeWindow, {animated: true});
	}
    if(Ti.Platform.version >= "7.0") {
        // iOS7で、全てのタブのwindow openイベントがアプリ起動時に発火してしまうのでfocusイベントに変更。
        self.addEventListener('focus', function(){
            if(!initLoaded) {
                Ti.API.info('-----------------------ResultsWindow init focus event');
                loadResults();
                initLoaded = true;
            }
        });
    } else {
        self.addEventListener('open', function(){
            Ti.API.info('-----------------------ResultsWindow init open event');
            loadResults();
        });
    }

	return self;
}
module.exports = ResultsWindow;
