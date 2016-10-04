/**
 * 順位表画面UI
 */
function StandingsWindow(tabGroup) {
	var Standings = require("/model/Standings");
    var config = require("/config").config;
	var util = require("util/util").util;
	var style = require("/util/style").style;
    var initLoaded = false;
	var isLoading = false;
    var currentCompeIdx = 0;    //J1の場合、0:1st、1:2nd、2:年間、3:ACL or ルヴァン
    var is2stages = true;   //2ステージ制フラグ
    var aclNabiscoCompeIdx = is2stages? 3 : 1;
    var currentStage = Ti.App.currentStage;  //ステージ(1st/2nd/total)
    if (currentStage == "2nd") {
        currentCompeIdx = 1;
    } else if(currentStage == "total") {
        currentCompeIdx = 2;
    }
    // ソートボタン
    var sortButton = Ti.UI.createButton({
        title: "ソート"
    });
    // 更新ボタン
    var refreshButton = Ti.UI.createButton();
    if(util.isiOS()) {
        refreshButton.systemButton = Ti.UI.iPhone.SystemButton.REFRESH;
    } else {
        refreshButton.title = "更新";
    }
	var self = Ti.UI.createWindow({
		title: "順位表"
        ,navBarHidden: false
        ,backgroundColor: style.common.backgroundColor
        ,barColor: style.common.barColor
        ,navTintColor: style.common.navTintColor
        ,rightNavButton: refreshButton
        ,leftNavButton: sortButton
        ,titleAttributes: {
            color: style.common.navTintColor
        }
	});
		
    if(util.isiOS() && Ti.Platform.version >= "7.0") {
        // iOS7で、全てのタブのwindow openイベントがアプリ起動時に発火してしまうのでfocusイベントに変更。
        self.addEventListener('focus', function(){
            if(!initLoaded) {
                Ti.API.info('-----------------------StandingsWindow focus event');
        		loadJStandings("", "seq");
                initLoaded = true;
        	}
    	});
    } else {
        self.addEventListener('open', function(){
            Ti.API.info('-----------------------StandingsWindow open event');
            loadJStandings("", "seq");
        });
    }
    if ("J1" == Ti.App.jcategory) {
        if (util.isiOS()) {
            var flexSpace = Ti.UI.createButton({
               systemButton:Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            });
            //ツールバー
            var compeButtonBar = Ti.UI.iOS.createTabbedBar(style.standings.compeButtonBar);
            var secondCompe = Ti.App.aclFlg ? "ACL" : "ルヴァン";
            if (is2stages) {
                compeButtonBar.labels = [
                    {title: Ti.App.jcategory + " 1st", enabled: true}
                    ,{title: Ti.App.jcategory + " 2nd", enabled: true}
                    ,{title: Ti.App.jcategory + "年間", enabled: true}
                    ,{title: secondCompe, enabled: true}
                ];
                compeButtonBar.width = 285;
            } else {
                compeButtonBar.labels = [{title: Ti.App.jcategory, enabled: true}, {title: secondCompe, enabled: true}];
            }
            compeButtonBar.setIndex(currentCompeIdx);
            compeButtonBar.addEventListener("click", function(e){
                if(isLoading) {
                    return;
                }
                if(currentCompeIdx != e.index) {
                    currentCompeIdx = e.index;
                    if ("J1" == Ti.App.jcategory && is2stages) {
                        if(0 <= e.index && e.index <= 2) {
                            if (e.index == 0) currentStage = "1st";
                            else if (e.index == 1) currentStage = "2nd";
                            else if (e.index == 2) currentStage = "total";
                            loadJStandings(currentStage, "seq");
                        }
                        else if(e.index == 3) {
                            if (Ti.App.aclFlg) {
                                loadACLStandings();
                            } else {
                                loadNabiscoStandings();
                            }
                        }
                    } else {
                        if(e.index == 0) {
                            loadJStandings("", "seq");
                        }
                        else if(e.index == 1) {
                            if (Ti.App.aclFlg) {
                                loadACLStandings();
                            } else {
                                loadNabiscoStandings();
                            }
                        }
                    }
                }
            });
            self.setToolbar([flexSpace, compeButtonBar, flexSpace]);
        } else {
            //Android
            var toolbar = createToolbarForAndroid();
            self.add(toolbar);
        }
    }
    //親ビュー
    var containerView = Ti.UI.createView(util.isiOS()? style.standings.standingsViewiPhone : style.standings.standingsViewAndroid);
    if ("J2" == Ti.App.jcategory) {
        containerView.bottom = 0;
    }
    self.add(containerView);
    // ヘッダー
    var jHeaderView;
    var aclNabiscoHeaderView;

    // テーブル    
    var table;
    // インジケータ
    var indicator = Ti.UI.createActivityIndicator({
        style: util.isiOS()? Ti.UI.ActivityIndicatorStyle.PLAIN : Ti.UI.ActivityIndicatorStyle.BIG
    });
    self.add(indicator);

    // リロードボタン
    refreshButton.addEventListener('click', function(e){
        if(isLoading) {
            return;
        }
        self.remove(table);
        if ("J1" == Ti.App.jcategory && is2stages) {
            if(0 <= currentCompeIdx && currentCompeIdx <= 2) {
                loadJStandings(currentStage, "seq");
            } else if(currentCompeIdx == 3){
                if (Ti.App.aclFlg) {
                    loadACLStandings();
                } else {
                    loadNabiscoStandings();
                }
            }
        } else {
            if(currentCompeIdx == 0) {
                loadJStandings("", "seq");
            } else if(currentCompeIdx == 1){
                if (Ti.App.aclFlg) {
                    loadACLStandings();
                } else {
                    loadNabiscoStandings();
                }
            }
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
                loadJStandings(currentStage, "gotGoal");
            } else if(1 == e.index) {
                loadJStandings(currentStage, "lostGoal");
            } else if(2 == e.index) {
                loadJStandings(currentStage, "diff");
            } else if(3 == e.index) {
                loadJStandings(currentStage, "win");
            } else if(4 == e.index) {
                loadJStandings(currentStage, "lost");
            } else if(5 == e.index) {
                loadJStandings(currentStage, "draw");
            } else if(6 == e.index) {
                loadJStandings(currentStage, "seq");
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
	 * Jリーグ順位表を読み込んで表示する
	 */
	function loadJStandings(stage, sort) {
        if(isLoading) {
            return;
        }
        sortButton.enabled = true;
        isLoading = true;
        indicator.show();
        self.title = Ti.App.jcategory + "順位表";
		//ヘッダー
		if(aclNabiscoHeaderView) {
		    containerView.remove(aclNabiscoHeaderView);
		}
        jHeaderView = createHeaderView(false);
        containerView.add(jHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);
        
		var standings = new Standings("J", currentStage);
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
     * ACL順位表を読み込んで表示する
     */
    function loadACLStandings() {
        if(isLoading) {
            return;
        }
        sortButton.enabled = false;
        isLoading = true;
        indicator.show();
        self.title = "ACL順位表";
        // ヘッダー
        if(jHeaderView) {
            containerView.remove(jHeaderView);
        }
        aclNabiscoHeaderView = createHeaderView(true);
        containerView.add(aclNabiscoHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);

        var standings = new Standings("ACL");
        standings.load("seq", {
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        Ti.API.info('>>>>>>>>' + util.toString(data));
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
     * ルヴァンカップ順位表を読み込んで表示する
     */
    function loadNabiscoStandings() {
        if(isLoading) {
            return;
        }
        sortButton.enabled = false;
        isLoading = true;
        indicator.show();
        self.title = "ルヴァン予選リーグ順位表";
        // ヘッダー
        if(jHeaderView) {
            containerView.remove(jHeaderView);
        }
        aclNabiscoHeaderView = createHeaderView(true);
        containerView.add(aclNabiscoHeaderView);
        // ボーダー
        var border = Ti.UI.createLabel(style.standings.border);
        containerView.add(border);

        var standings = new Standings("Nabisco");
        standings.load("seq", {
            success: function(standingsDataList) {
                try {
                    var rows = new Array();
                    for(i=0; i<standingsDataList.length; i++) {
                        var data = standingsDataList[i];
                        if(!data) {
                            continue;
                        }
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
        var labelColor = style.common.mainTextColor;
        if(config.teamName == team) {
            if (style.standings.teamFontColor) {
                labelColor = style.standings.teamFontColor;
            }
            row.backgroundColor = style.standings.backgroundColor;
        }
        // 順位
        var rankLabel = createRowLabel(rank, 2, 23, 'center', labelColor);
        row.add(rankLabel);
        // チーム
        var teamWidth = 74;
        if(aclFlg) teamWidth = 120;
        if(team.length > 4) {
            var idx = team.indexOf("・");
            if (idx != -1) {
                team = team.substring(0, idx);
            }
        }
        var teamLabel = createRowLabel(team, 27, teamWidth, 'left', labelColor);

        row.add(teamLabel);
        var leftPos = 93;
        var w = 32;
        var w2 = 30;
        if(aclFlg) {
            leftPos += 25;
            w = 28;
            w2 = 28;
        }
        // 勝点
        var pointLabel = createRowLabel(point, leftPos, w2, "right", labelColor);
        row.add(pointLabel);
        // 勝
        var winLabel = createRowLabel(win, leftPos+(w*1), w2, "right", labelColor);
        row.add(winLabel);
        // 分
        var drawLabel = createRowLabel(draw, leftPos+(w*2), w2, "right", labelColor);
        row.add(drawLabel);
        // 負
        var loseLabel = createRowLabel(lose, leftPos+(w*3), w2, "right", labelColor);
        row.add(loseLabel);
        // 得
        var gotGoalLabel = createRowLabel(gotGoal, leftPos+(w*4), w2, "right", labelColor);
        row.add(gotGoalLabel);
        // 失
        var lostGoalLabel = createRowLabel(lostGoal, leftPos+(w*5), w2, "right", labelColor);
        row.add(lostGoalLabel);
        // 差
        var diffGoalLabel = createRowLabel(diffGoal, leftPos+(w*6), w2, "right", labelColor);
        row.add(diffGoalLabel);
        return row;
    }
    
    /**
     * TableViewRowに乗せるラベルを生成して返す
     * @param {Object} text
     * @param {Object} left
     * @param {Object} width
     * @param {Object} textAlign
     * @param {Object} labelColor
     */
    function createRowLabel(text, left, width, textAlign, labelColor) {
        if(!textAlign) {
            textAlign = 'right';
        }
        var label = Ti.UI.createLabel({
            text: text
            ,textAlign: textAlign
            ,left: left
            ,width: width
            ,color: labelColor
            ,font: {fontSize: 17}
            
            //,borderColor: 'white'
            //,borderWidth: 1
        });
        return label;
    }

    /**
     * [Android用] ソートボタン、リーグ切替ツールバーを生成する。
     */
    function createToolbarForAndroid() {
        var platformWidth = Ti.Platform.displayCaps.platformWidth;
        var sortLeft  = 5;
        var sortBtn = Ti.UI.createButton(style.standings.sortButtonAndroid);
        sortBtn.left = sortLeft;
        // ソートボタン
        sortBtn.addEventListener('click', function(e){
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
                    loadJStandings(currentStage, "gotGoal");
                } else if(1 == e.index) {
                    loadJStandings(currentStage, "lostGoal");
                } else if(2 == e.index) {
                    loadJStandings(currentStage, "diff");
                } else if(3 == e.index) {
                    loadJStandings(currentStage, "win");
                } else if(4 == e.index) {
                    loadJStandings(currentStage, "lost");
                } else if(5 == e.index) {
                    loadJStandings(currentStage, "draw");
                } else if(6 == e.index) {
                    loadJStandings(currentStage, "seq");
                }
            });
            sortDialog.show();
        });
        var jBtnLeft  = sortLeft + 70;
        //Jリーグ
        var jBtn1st = Ti.UI.createButton(style.standings.jButtonAndroid);
        jBtn1st.title = Ti.App.jcategory;
        jBtn1st.left = jBtnLeft;
        var jBtn2nd;
        var jBtnTotal;
        var btnWidth = 70;
        if (is2stages) {
            jBtnLeft  = sortLeft + 70;
            //1st
            jBtn1st.title = Ti.App.jcategory + " 1st";
            jBtn1st.left = jBtnLeft;
            //2nd
            jBtn2nd = Ti.UI.createButton(style.standings.jButtonAndroid);
            jBtn2nd.title = Ti.App.jcategory + " 2nd";
            jBtn2nd.left = jBtnLeft + 70;
            //年間
            jBtnTotal = Ti.UI.createButton(style.standings.jButtonAndroid);
            jBtnTotal.title = Ti.App.jcategory + "年間";
            jBtnTotal.left = jBtnLeft + 140;
            //ボタン有効化
            if (currentStage == "1st") {
                jBtn1st.opacity = 0.5;
                jBtn1st.enabled = false;
            } else if (currentStage == "2nd") {
                jBtn2nd.opacity = 0.5;
                jBtn2nd.enabled = false;
            } else {
                jBtnTotal.opacity = 0.5;
                jBtnTotal.enabled = false;
            }
        }
        //ACL / Nabisco
        var aclNabisco = Ti.UI.createButton(style.standings.aclNabiscoButtonAndroid);
        aclNabisco.title = Ti.App.aclFlg ? "ACL" : "ﾅﾋﾞｽｺ";
        aclNabisco.left = jBtnLeft + 210;
        
        jBtn1st.addEventListener("click", function(e){
            if(currentCompeIdx != 0) {
                currentCompeIdx = 0;
                currentStage = "1st";
                jBtn1st.enabled = false;    jBtn1st.color = "white";    jBtn1st.opacity = 0.5;
                jBtn2nd.enabled = true;    jBtn2nd.color = "black";    jBtn2nd.opacity = 1;
                jBtnTotal.enabled = true;    jBtnTotal.color = "black";    jBtnTotal.opacity = 1;
                aclNabisco.enabled = true;  aclNabisco.color = "black"; aclNabisco.opacity = 1;
                sortBtn.enabled = true; sortBtn.color = "black";    sortBtn.opacity = 1;
                loadJStandings(currentStage, "seq");
            }
        });
        jBtn2nd.addEventListener("click", function(e){
            if(currentCompeIdx != 1) {
                currentCompeIdx = 1;
                currentStage = "2nd";
                jBtn1st.enabled = true;    jBtn1st.color = "black";    jBtn1st.opacity = 1;
                jBtn2nd.enabled = false;    jBtn2nd.color = "white";    jBtn2nd.opacity = 0.5;
                jBtnTotal.enabled = true;    jBtnTotal.color = "black";    jBtnTotal.opacity = 1;
                aclNabisco.enabled = true;  aclNabisco.color = "black"; aclNabisco.opacity = 1;
                sortBtn.enabled = true; sortBtn.color = "black";    sortBtn.opacity = 1;
                loadJStandings(currentStage, "seq");
            }
        });
        jBtnTotal.addEventListener("click", function(e){
            if(currentCompeIdx != 2) {
                currentCompeIdx = 2;
                currentStage = "Total";
                jBtn1st.enabled = true;    jBtn1st.color = "black";    jBtn1st.opacity = 1;
                jBtn2nd.enabled = true;    jBtn2nd.color = "black";    jBtn2nd.opacity = 1;
                jBtnTotal.enabled = false;    jBtnTotal.color = "white";    jBtnTotal.opacity = 0.5;
                aclNabisco.enabled = true;  aclNabisco.color = "black"; aclNabisco.opacity = 1;
                sortBtn.enabled = true; sortBtn.color = "black";    sortBtn.opacity = 1;
                loadJStandings(currentStage, "seq");
            }
        });
        aclNabisco.addEventListener("click", function(e){
            if(currentCompeIdx != aclNabiscoCompeIdx) {
                currentCompeIdx = aclNabiscoCompeIdx;
                jBtn1st.enabled = true;     jBtn1st.color = "black";    jBtn1st.opacity = 1;
                jBtn2nd.enabled = true;    jBtn2nd.color = "black";    jBtn2nd.opacity = 1;
                jBtnTotal.enabled = true;    jBtnTotal.color = "black";    jBtnTotal.opacity = 1;
                aclNabisco.enabled = false; aclNabisco.color = "white"; aclNabisco.opacity = 0.5;
                sortBtn.enabled = false;    sortBtn.color = "white";    sortBtn.opacity = 0.5;
                if (Ti.App.aclFlg) {
                    loadACLStandings();
                } else {
                    loadNabiscoStandings();
                }
            }
        });
        var toolbar = Ti.UI.createView({
            backgroundColor: style.common.navTintColor
            ,width: Ti.UI.FILL
            ,height: 46
            ,bottom: 0
        });
        toolbar.add(sortBtn);
        if (is2stages) {
            toolbar.add(jBtn1st);
            toolbar.add(jBtn2nd);
            toolbar.add(jBtnTotal);
        } else {
            toolbar.add(jBtn1st);
        }
        toolbar.add(aclNabisco);
        return toolbar;
    }

	return self;
}
module.exports = StandingsWindow;
