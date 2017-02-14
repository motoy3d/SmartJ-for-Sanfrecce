/**
 * 日程・結果画面UI
 */
function ResultsWindow(tabGroup, otherTeamId, otherTeamName) {
    Ti.API.info('ResultsWindow  otherTeamId=' + otherTeamId + ", otherTeamName=" + otherTeamName);
    var config = require("/config").config;
    var util = require("/util/util").util;
	var Results = require("/model/Results");
    var Standings = require("/model/Standings");
    var WebWindow = require(util.isiOS()? "/ui/handheld/WebWindow" : "/ui/handheld/WebWindowAndroid");
	var YoutubeWindow = require("/ui/handheld/YoutubeWindow");
	var style = require("/util/style").style;
	var initLoaded = false;

    // 更新ボタン
    var refreshButton = Ti.UI.createButton();
    if(util.isiOS()) {
        refreshButton.systemButton = Ti.UI.iPhone.SystemButton.REFRESH;
    } else {
        refreshButton.title = "更新";
    }
	var self = Ti.UI.createWindow({
		title: otherTeamId? otherTeamName + " 日程" : "日程・結果"
        ,navBarHidden: false
        ,backgroundColor: style.common.backgroundColor
        ,barColor: otherTeamId? "#ccc" : style.common.barColor
        ,navTintColor: otherTeamId?  "black" : style.common.navTintColor
        ,rightNavButton: refreshButton
        ,titleAttributes: {
            color: otherTeamId?  "black" : style.common.navTintColor
        }
	});
	self.loadDetailHtml = loadDetailHtml;	//function
	self.searchMovie = searchMovie;	//function
    // テーブル
    var tableView = Ti.UI.createTableView(style.results.table); 
    var results = new Results(self, otherTeamId, otherTeamName);
    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        self.remove(tableView);
        indicator.show();
        loadResults();
    });
	// インジケータ
    var indicator = Ti.UI.createActivityIndicator({
        style: util.isiOS()? Ti.UI.ActivityIndicatorStyle.PLAIN : Ti.UI.ActivityIndicatorStyle.BIG
    });
	self.add(indicator);
	
	if (!otherTeamId) {
    	// 他チーム日程ツールバー
        if (util.isiOS()) {
            var flexSpace = Ti.UI.createButton({
               systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            });
            //ツールバー
            var buttonBar = Ti.UI.createButtonBar(style.results.buttonBar);
            buttonBar.labels = [{title: "他チーム日程"}];
            buttonBar.addEventListener("click", function(e){
                openOtherTeamWin();
            });
            self.setToolbar([flexSpace, buttonBar, flexSpace]);
        } else {    //Android
            var toolbar = createToolbarForAndroid();
            self.add(toolbar);
            tableView.bottom = 46;
        }
    }

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
			    Ti.API.info('rowsData.length=' + rowsData.length);
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
				    if (rowsData.length <= 1) {
				        util.showMsg("日程が読み込めませんでした。\n準備ができるまでお待ちください");
				    } else {
    					self.add(tableView);
    					tableView.setData(rowsData);                        if(3 < rowIdx) {
                            Ti.API.info('rowIdx=' + rowIdx);
                            //最新試合が真ん中に来るように
                            if(util.isAndroid()) {
                                tableView.scrollToIndex(rowIdx - 1);    
                            } else {
                                tableView.scrollToIndex(rowIdx + 2);    
                            }
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
        if (util.isAndroid()) {
        	Ti.Platform.openURL(detailUrl);
        } else {
			var webData = {
				title : "試合詳細"
				,link : detailUrl
				,navBarHidden: true
				,toolbarVisible: true
				,isBlockReportEnable : false
			};
			var webWindow = new WebWindow(webData);
	        tabGroup.activeTab.open(webWindow, {animated: true});
		}
	}

	/**
	 * 動画検索結果を表示する (Results.jsから呼ぶ)
	 */
	function searchMovie(title, gameDate) {
        var youtubeWindow = new YoutubeWindow(title, gameDate, otherTeamId);
        tabGroup.activeTab.open(youtubeWindow, {animated: true});
	}
	
    /**
     * 他チーム日程ウィンドウを開く
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
            text: " 他チーム日程"
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
            var otherTeamResultsWin = new ResultsWindow(tabGroup, e.rowData.teamId, e.rowData.teamName);
            tabGroup.activeTab.open(otherTeamResultsWin, {animated: true});
        });
        //閉じるボタン
        var closeBtn = Ti.UI.createButton({
            title: "閉じる"
            ,width: 140
            ,height: 40
            ,bottom: 0
        });
        if (util.isAndroid()) {
        	closeBtn.backgroundColor = "#ccc";
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
    /**
     * [Android用] 他チーム日程ツールバーを生成する。
     */
    function createToolbarForAndroid() {
        var platformWidth = Ti.Platform.displayCaps.platformWidth;
        var otherTeamBtn = Ti.UI.createButton(style.results.otherTeamBtnAndroid);
        otherTeamBtn.addEventListener("click", function(e){
            openOtherTeamWin();
        });
        var toolbar = Ti.UI.createView({
            backgroundColor: "#efefef"
            ,width: Ti.UI.FILL
            ,height: 46
            ,bottom: 0
        });
        toolbar.add(otherTeamBtn);
        return toolbar;
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
