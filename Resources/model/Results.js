/**
 * 試合日程・結果データ取得サービス 
 */
function Results(resultsWindow) {
    var config = require("/config").config;
	var util = require("util/util").util;
	var style = require("util/style").style;
    var XHR = require("util/xhr");
	var self = {};
	self.load = load;
//	self.createRow = createRow;
	
    var teamNameEncoded = encodeURIComponent(config.teamName);
    var highlightEncoded = encodeURIComponent('ハイライト');

	/**
	 * クラブ公式サイトの試合日程htmlを読み込む
	 */
	function load(callback) {
        Ti.API.info('---------------------------------------------------------------------');
        Ti.API.info(util.formatDatetime() + '  日程・結果読み込み');
        Ti.API.info('---------------------------------------------------------------------');
        // オンラインチェック
        if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
        }
        Ti.App.Analytics.trackPageview('/results');
		var before = new Date();
		var currentSeason = util.getCurrentSeason();
		Ti.API.debug("シーズン＝" + currentSeason);
		
        var resultsUrl = config.resultsUrl + util.getCurrentSeason();
		Ti.API.info("★★★日程読み込み " + resultsUrl);
		//Ti.Yahoo.yql(config.resultsQuery, function(e) {
        var xhr = new XHR();
        xhr.get(resultsUrl, onSuccessCallback, onErrorCallback, { ttl: 1 });
        function onSuccessCallback(e) {
			try {
				if(e.data == null) {
					Ti.API.error("e.data == null");
					callback.fail(style.common.loadingFailMsg);
					return;
				}
				//Ti.API.debug("e.data■" + e.data);
                var json = JSON.parse(e.data);
                //Ti.API.info('>>> json=' + json);
				var rowsData = json.map(
					function(item) {
						var row = createRow(item, currentSeason);
						if(row) {
						  return row;
						}
					}
				);
				//Ti.API.debug('---------rowsData=' + rowsData.length);
				callback.success(rowsData);
			} catch(ex) {
				Ti.API.info('エラー：' + ex);
				callback.fail(style.common.loadingFailMsg);
			} finally {
				var after = new Date();
				Ti.API.info("Results.js#load() 処理時間★" 
					+ (after.getTime()-before.getTime())/1000.0 + "秒");
			}
		};
		function onErrorCallback(e) {
		    Ti.API.error(e);
		};		
	}

	/**
	 * TableViewRowを生成する
	 */
	function createRow(item, currentSeason) {
        var compe = item.compe;
        var date = item.game_date2;
//      if(date.content) {
//          date = util.removeLineBreak(util.replaceAll(date.content, "<br/>", ""));
//      }
        //Ti.API.debug('■' + date);
        var time = "";
        var team = "未定";
        if(item.kickoff_time) {
            time = item.kickoff_time;
        }
        var stadium = "";
        if(item.stadium) {
            stadium = item.stadium;
        }
        // Home/Away
        var isHome = item.home_flg;
        team = item.vs_team;
        var score = "";
        var resultImage = "";
        var detailUrl = "";
        if(item.result) {
            result = item.result;
            score = item.score;
            detailUrl = item.detail_url;
			Ti.API.info(team + ' スコア ' + score + "　" + result + ".");
            if("○" == result) {
                resultImage = "/images/win.png";
            } else if("△" == result) {
                resultImage = "/images/draw.png";
            } else {
                resultImage = "/images/lose.png";
            }
		}
		//Ti.API.info('★' + isHome + " : " + team + " : " + score + " : " + detailUrl);
		var hasDetailResult = detailUrl != "";
		//Ti.API.debug(compe + " " + date + " " + time + " " + team + " " + stadium + " " + score);
		// Ti.API.debug("hasDetailResult=" + hasDetailResult);
		var row = Ti.UI.createTableViewRow(style.results.tableViewRow);
		row.detailUrl = detailUrl;
		// 日付ラベル
		var dateLabel = Ti.UI.createLabel(style.results.dateLabel);
		dateLabel.text = date + " " + time;
		row.add(dateLabel);
		// 大会ラベル
		var compeLabel = Ti.UI.createLabel(style.results.compeLabel);
		compeLabel.text = compe;
		row.add(compeLabel);
		// 会場ラベル
		var stadiumLabel = Ti.UI.createLabel(style.results.stadiumLabel);
		stadiumLabel.text = stadium;
		row.add(stadiumLabel);
		// 対戦相手チームラベル
		var teamLabel = Ti.UI.createLabel(style.results.teamLabel);
		var teamName = 'vs ' + team;
		if(team == "" || teamName == 'vs [object Object]') {
			teamName = 'vs 未定';
		}
		teamLabel.text = teamName;
		row.add(teamLabel);
		
        // 結果イメージラベル、スコアラベル
        if(score != "") {
            var scoreLabel;
            if (score.indexOf('PK') == -1) {
                scoreLabel = Ti.UI.createLabel(style.results.scoreLabel);
            } else {
                scoreLabel = Ti.UI.createLabel(style.results.scoreLabelSmall);
            }
            var resultLabel = Ti.UI.createImageView(style.results.resultLabel);
            scoreLabel.text = score;
            resultLabel.image = resultImage;
            //Ti.API.info('-------' + teamName + ": " + score + " : " + resultImage);
            row.add(scoreLabel);
            row.add(resultLabel);
        }
	
		// 詳細リンクボタン
		var detailButton = Ti.UI.createButton(style.results.detailButton);
		detailButton.setEnabled(hasDetailResult);
		// 試合詳細ウィンドウを開くイベント
		detailButton.addEventListener('click', function() {
			resultsWindow.loadDetailHtml(detailUrl);
		});
		row.add(detailButton);
		// 動画リンクボタン
		var movieButton = Ti.UI.createButton(style.results.movieButton);
        movieButton.setEnabled(hasDetailResult);
		// 試合動画ウィンドウを開くイベント
		movieButton.addEventListener('click', function() {
		    Ti.API.debug('>>>>>>>>>>> date=' + item.game_date1);
		    var gameDate = new Date(item.game_date1);
			var monthDate = new Array(gameDate.getMonth()+1, gameDate.getDate());
			var month = monthDate[0];
			if(month.length == 1) {
				month = '0' + month;
			}
			var day = monthDate[1];
			if(day.length == 1) {
				day = '0' + day;
			}
			// 動画検索キーワード作成
            var dateYYMMDD = String(currentSeason).substring(2) + month + day;
            var dateYYYYMMDD1 = currentSeason + "." + month + "." + day;
            var dateYYYYMMDD2 = currentSeason + "." + monthDate[0] + "." + day;
            var dateYYYYMMDD3 = currentSeason + "/" + monthDate[0] + "/" + day;
            var dateYYYYMMDD4 = currentSeason + "/" + month + "/" + day;
//            var dateYYYYMMDD = encodeURIComponent(currentSeason + "年" + month + "月" + day + "日");
            var teamEncoded = encodeURIComponent(team);
            var keyword1 = dateYYMMDD + '+' + teamEncoded + "+" + highlightEncoded;
            var keyword2 = dateYYYYMMDD1 + '+' + teamNameEncoded + '+' + teamEncoded /*+ encodeURIComponent("戦")*/;
            var keyword3 = dateYYYYMMDD2 + '+' + teamNameEncoded + '+' + teamEncoded;
            var keyword4 = dateYYYYMMDD3 + '+' + teamNameEncoded + '+' + teamEncoded;
            var keyword5 = dateYYYYMMDD4 + '+' + teamNameEncoded + '+' + teamEncoded;
            
            Ti.API.info("キーワード：" + keyword1 + "  :  " + keyword2 + " : " + keyword3);
            // ResultsWindow側の処理を呼び出す
            resultsWindow.searchMovie({
                title: compe + "(" + date + ") vs " + team
                ,key1: keyword1
                ,key2: keyword2
                ,key3: keyword3
                ,key4: keyword4
                ,key5: keyword5
                ,team: team
                ,date: dateYYYYMMDD1
            });
		});
		row.add(movieButton);
		//Ti.API.debug('row====' + row);
		return row;
	}
	return self;	
}

module.exports = Results;