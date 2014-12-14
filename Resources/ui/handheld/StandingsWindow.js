/**
 * 順位表画面UI
 */
function StandingsWindow(tabGroup) {
	var Standings = require("/model/Standings");
    var ACLStandings = require("/model/ACLStandings");
    var NabiscoStandings = require("/model/NabiscoStandings");
    var config = require("/config").config;
	var util = require("util/util").util;
	var style = require("/util/style").style;
    var initLoaded = false;
	var isLoading = false;
    // ソートボタン
    var sortButton = Ti.UI.createButton({
        title: "ソート"
    });
    // 更新ボタン
    var refreshButton = Ti.UI.createButton();
    if(util.isiPhone()) {
        refreshButton.systemButton = Ti.UI.iPhone.SystemButton.REFRESH;
    } else {
        refreshButton.title = "更新";
    }
	var self = Ti.UI.createWindow({
		title: "順位表"
        ,navBarHidden: false
        ,backgroundColor: 'black'
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
        ,rightNavButton: refreshButton
        ,leftNavButton: sortButton
	});
		
    if(util.isiPhone() && Ti.Platform.version >= "7.0") {
        // iOS7で、全てのタブのwindow openイベントがアプリ起動時に発火してしまうのでfocusイベントに変更。
        self.addEventListener('focus', function(){
            if(!initLoaded) {
                Ti.API.info('-----------------------StandingsWindow focus event');
        		loadJ1Standings();
                initLoaded = true;
        	}
    	});
    } else {
        self.addEventListener('open', function(){
            Ti.API.info('-----------------------StandingsWindow open event');
            loadJ1Standings();
        });
    }
    var currentCompeIdx = 0;    //0:J1、1:ACL or ナビスコ
/*
    if(util.isiPhone()) {
        //大会
        var flexSpace = Ti.UI.createButton({
           systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });
        //ツールバー
        var compeButtonBar = Ti.UI.iOS.createTabbedBar(style.standings.compeButtonBar);
    //    compeButtonBar.labels = [{title: 'J1', enabled: false}, {title: 'ACL', enabled: true}];
        compeButtonBar.labels = [{title: 'J1', enabled: true}, {title: 'ナビスコ', enabled: true}];
        compeButtonBar.setIndex(0);
        compeButtonBar.addEventListener("click", function(e){
            if(isLoading) {
                return;
            }
            if(currentCompeIdx != e.index) {
                currentCompeIdx = e.index;
                if(e.index == 0) {
                    compeButtonBar.setIndex(0);
                    loadJ1Standings();
                }
                else if(e.index == 1) {
                    compeButtonBar.setIndex(1);
                    // loadACLStandings();
                    loadNabiscoStandings();
                }
            }
        });
    //    self.setRightNavButton(compeButtonBar);
        self.setToolbar([flexSpace, compeButtonBar, flexSpace]);
    }
    */
    //親ビュー
    var containerView = Ti.UI.createView(style.standings.standingsView);
    self.add(containerView);
    // ヘッダー
    var j1HeaderView;
    var aclNabiscoHeaderView;

    // テーブル    
    var table;
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator({
        style: util.isiPhone()? Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN : Ti.UI.ActivityIndicatorStyle.BIG
    });
    self.add(indicator);

    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        if(isLoading) {
            return;
        }
        self.remove(table);
        if(currentCompeIdx == 0) {
            loadJ1Standings();
        } else if(currentCompeIdx == 1){
            //loadACLStandings();
            loadNabiscoStandings();
        }
    });
    // ソートボタン
    sortButton.addEventListener('click', function(e){
        if(isLoading) {
            return;
        }
        
        var optionsArray = new Array("得点数でソート", "失点数でソート", "得失点差でソート", 
            "勝利数でソート", "敗北数でソート", "引き分け数でソート", "順位でソート", "キャンセル");
        var sortDialog = Ti.UI.createOptionDialog({options: optionsArray});
        sortDialog.addEventListener("click", function(e){
            if(7 == e.index) {
                return;
            }
            if(0 == e.index) {
                loadJ1Standings("gotGoal");
            } else if(1 == e.index) {
                loadJ1Standings("lostGoal");
            } else if(2 == e.index) {
                loadJ1Standings("diff");
            } else if(3 == e.index) {
                loadJ1Standings("win");
            } else if(4 == e.index) {
                loadJ1Standings("lost");
            } else if(5 == e.index) {
                loadJ1Standings("draw");
            } else if(6 == e.index) {
                loadJ1Standings();
            }
        });
        sortDialog.show();
    });

    /**
     * ヘッダービューを生成する 
     */
    function createHeaderView(aclFlg) {
        var headerView1 = Ti.UI.createView(style.standings.headerView);    
        var rankHeader = createHeaderLabel('位', 5);
        var teamHeader = createHeaderLabel('チーム', 30);
        var leftPos = 100;
        var w = 33;
        if(aclFlg) {
            leftPos += 30;
            w = 28;
        }
        var pointHeader = createHeaderLabel('点', leftPos);
        var winHeader = createHeaderLabel('勝', leftPos+(w*1));
        var drawHeader = createHeaderLabel('分', leftPos+(w*2));
        var loseHeader = createHeaderLabel('負', leftPos+(w*3));
        var gotGoalHeader = createHeaderLabel('得', leftPos+(w*4));
        var lostGoalHeader = createHeaderLabel('失', leftPos+(w*5));
        var diffGoalHeader = createHeaderLabel('差', leftPos+(w*6));
        headerView1.add(rankHeader);
        headerView1.add(teamHeader);
        headerView1.add(pointHeader);
        headerView1.add(winHeader);
        headerView1.add(drawHeader);
        headerView1.add(loseHeader);
        headerView1.add(gotGoalHeader);
        headerView1.add(lostGoalHeader);
        headerView1.add(diffGoalHeader);
        return headerView1;
    }
    
	/**
	 * J1順位表を読み込んで表示する
	 */
	function loadJ1Standings(sort) {
        if(isLoading) {
            return;
        }
        sortButton.enabled = true;
        isLoading = true;
        indicator.show();
        self.title = "J1順位表";
//        compeButtonBar.setLabels([{title: 'J1', enabled: false}, {title: 'ACL', enabled: true}]);
		//ヘッダー
		if(aclNabiscoHeaderView) {
		    containerView.remove(aclNabiscoHeaderView);
		}
        j1HeaderView = createHeaderView(false);
        containerView.add(j1HeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);
        
		var standings = new Standings();
		standings.load(sort, {
			success: function(standingsDataList) {
				try {
				    var rows = new Array();
				    for(i=0; i<standingsDataList.length; i++) {
				        var data = standingsDataList[i];
				        rows.push(createRow(
				            data.rank, data.team, data.point, data.win, data.draw, data.lose
				            , data.gotGoal, data.lostGoal, data.diff, false)
				        );
				    }
                    table = Ti.UI.createTableView(style.standings.table);
				    table.setData(rows);
				    containerView.add(table);
				} catch(e) {
					Ti.API.error(e);
				} finally {
					indicator.hide();
					isLoading = false;
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
	}
    /**
     * YahooスポーツサイトのACLのhtmlを読み込んで表示する
     */
    function loadACLStandings() {
        if(isLoading) {
            return;
        }
        sortButton.enabled = false;
        isLoading = true;
        indicator.show();
        self.title = "ACL順位表";
//        compeButtonBar.setLabels([{title: 'J1', enabled: true}, {title: 'ACL', enabled: false}]);
        // ヘッダー
        if(j1HeaderView) {
            containerView.remove(j1HeaderView);
        }
        aclNabiscoHeaderView = createHeaderView(true);
        containerView.add(aclNabiscoHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);

        var standings = new ACLStandings();
        standings.load({
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        rows.push(createRow(
                            data.rank, data.team, data.point, data.win, data.draw, data.lose
                            , data.gotGoal, data.lostGoal, data.diff, true)
                        );
                    }
                    table = Ti.UI.createTableView(style.standings.table);
                    table.height = 120;
                    table.setData(rows);
                    containerView.add(table);
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    indicator.hide();
                    isLoading = false;
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
    }

    /**
     * Jリーグ公式サイトサイトのナビスコのhtmlを読み込んで表示する
     */
    function loadNabiscoStandings() {
        if(isLoading) {
            return;
        }
        sortButton.enabled = false;
        isLoading = true;
        indicator.show();
        self.title = "ナビスコ予選リーグ順位表";
//        compeButtonBar.setLabels([{title: 'J1', enabled: true}, {title: 'ACL', enabled: false}]);
        // ヘッダー
        if(j1HeaderView) {
            containerView.remove(j1HeaderView);
        }
        aclNabiscoHeaderView = createHeaderView(true);
        containerView.add(aclNabiscoHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);

        var standings = new NabiscoStandings();
        standings.load({
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        if(!data) {
                            continue;
                        }
Ti.API.info('rows.push '  + i);
                        rows.push(createRow(
                            data.rank, data.team, data.point, data.win, data.draw, data.lose
                            , data.gotGoal, data.lostGoal, data.diff, true)
                        );
                    }
                    table = Ti.UI.createTableView(style.standings.table);
                    table.height = 210;
                    table.setData(rows);
                    containerView.add(table);
                } catch(e) {
                    Ti.API.error(e);
                } finally {
                    indicator.hide();
                    isLoading = false;
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
    }

    /**
     * ヘッダーラベルを生成して返す
     */
    function createHeaderLabel(name, left) {
        var label = Ti.UI.createLabel(style.standings.headerLabel);
        label.text = name;
        label.left = left;
        return label;
    }
    
    /**
     * TableViewRowを生成して返す
     * @param {Object} rank
     * @param {Object} team
     * @param {Object} point
     * @param {Object} win
     * @param {Object} draw
     * @param {Object} lose
     * @param {Object} gotGoal
     * @param {Object} lostGoal
     * @param {Object} diff
     * @param {Object} aclFlg
     */
    function createRow(rank, team, point, win, draw, lose, gotGoal, lostGoal, diffGoal, aclFlg) {
        var row = Ti.UI.createTableViewRow(style.standings.tableViewRow);
        // 順位
        var rankLabel = createRowLabel(rank, 5, 20, 'center');
        row.add(rankLabel);
        // チーム
        var teamWidth = 60;
        if(aclFlg) teamWidth = 100;
        if(team.length > 4) {
            var idx = team.indexOf("・");
            team = team.substring(0, idx);
        }
        var teamLabel = createRowLabel(team, 30, teamWidth, 'left');

        row.add(teamLabel);
        var leftPos = 93;
        var w = 33;
        var w2 = 26;
        if(aclFlg) {
            leftPos += 30;
            w = 28;
        }
        // 勝点
        var pointLabel = createRowLabel(point, leftPos, w2);
        row.add(pointLabel);
        // 勝
        var winLabel = createRowLabel(win, leftPos+(w*1), w2);
        row.add(winLabel);
        // 分
        var drawLabel = createRowLabel(draw, leftPos+(w*2), w2);
        row.add(drawLabel);
        // 負
        var loseLabel = createRowLabel(lose, leftPos+(w*3), w2);
        row.add(loseLabel);
        // 得
        var gotGoalLabel = createRowLabel(gotGoal, leftPos+(w*4), w2);
        row.add(gotGoalLabel);
        // 失
        var lostGoalLabel = createRowLabel(lostGoal, leftPos+(w*5), w2);
        row.add(lostGoalLabel);
        // 差
        var diffGoalLabel = createRowLabel(diffGoal, leftPos+(w*6), w2);
        row.add(diffGoalLabel);
        // クラブ背景色
        if(config.teamName == team) {
            row.backgroundColor = style.standings.backgroundColor;
        }
        return row;
    }
    
    /**
     * TableViewRowに乗せるラベルを生成して返す
     * @param {Object} text
     * @param {Object} left
     * @param {Object} width
     */
    function createRowLabel(text, left, width, textAlign) {
        if(!textAlign) {
            textAlign = 'right';
        }
        var label = Ti.UI.createLabel({
            text: text
            ,textAlign: textAlign
            ,left: left
            ,width: width
            ,color: 'white'
        });
        return label;
    }
	return self;
}
module.exports = StandingsWindow;
