/**
 * ナビスコ順位表取得サービス
 * Jリーグ公式から読み込み
 * ※Yahoo スポーツ：http://soccer.yahoo.co.jp/jleague/standings/jleaguecup
 */
function NabiscoStandings() {
	var util = require("util/util").util;
    var style = require("util/style").style;

	var self = {};
	self.load = load;
	// YQL
	var standingsQuery = "select * from html"
	   + " where url='http://www.j-league.or.jp/standings/standings_ync.html' "
       + " and xpath=\"//div[@class='content-d2r']/div/table/tbody/tr\"";

	/**
	 * Jリーグ公式サイトサイトのhtmlを読み込んで表示する
	 */
	function load(callback) {
	    Ti.API.info('---------------------------------------------------------------------');
	    Ti.API.info(util.formatDatetime() + '  順位表読み込み');
        Ti.API.info('---------------------------------------------------------------------');
        
		// オンラインチェック
		if(!Ti.Network.online) {
            callback.fail(style.common.offlineMsg);
            return;
		}
		Ti.App.Analytics.trackPageview('/standingsNabisco');
		var before = new Date();
		var standingBody = "";
		Ti.API.info('★★順位表YQL ' + standingsQuery);
		Ti.Yahoo.yql(standingsQuery, function(e) {
			try {
				if(e.data == null) {
				    var month = new Date().getMonth() + 1;
				    if(month == 2) {
                        callback.fail("新シーズンの開幕までお待ちください");
				    } else {
                        callback.fail(style.common.loadingFailMsg);
				    }
					return;
				}
				var standingsDataList = new Array();
				Ti.API.debug("e.data.tr■" + e.data.tr.length);
				var dataList = e.data.tr;			
				for(i=0; i<dataList.length; i++) {
					// タグからデータ抽出
					var tdList = dataList[i]["td"];
					var rank = tdList[1].p;
	//				var image = tdList[2].a.img.src;
	                var team = tdList[2].a.span.span[1].content;
					var point = tdList[3].p;
					var games = tdList[4].p;
					var win = tdList[5].p;
					var draw = tdList[6].p;
					var lose = tdList[7].p;
					var gotGoal = tdList[8].p;
					var lostGoal = tdList[9].p;
					var diff = tdList[10].p;
					// var gridRow = new GridRow(gridRowClassName);
					//Ti.API.info(i + "★gridRow=" + gridRow);
					Ti.API.debug(rank + ' : ' + team + ' : ' + point);
					
					var standingsData = {
					    rank: rank
					    ,team: team
					    ,point: point
					    ,win: win
					    ,draw: draw
					    ,lose: lose
					    ,gotGoal: gotGoal
					    ,lostGoal: lostGoal
					    ,diff: diff
					};
					standingsDataList.push(standingsData);
				}
				callback.success(standingsDataList);
				Ti.API.info('+++++++++++++++++++ YQL終了. 件数=' + standingsDataList.length);
			} catch(ex) {
				Ti.API.error('---------------------\n' + ex);	
                callback.fail(style.common.loadingFailMsg);
			} finally {
			}
			var after = new Date();
			Ti.API.info("Standings.js#load() 処理時間★" 
				+ (after.getTime()-before.getTime())/1000.0 + "秒");
		});
	}
	return self;
}
module.exports = NabiscoStandings;
