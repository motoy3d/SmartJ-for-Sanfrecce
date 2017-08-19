/**
 * ACL順位表取得サービス
 * Yahoo スポーツから読み込み
 */
function ACLStandings() {
	var util = require("util/util").util;
    var style = require("util/style").style;

	var self = {};
	self.load = load;
	// YQL
	var standingsQuery = "select * from html"
	   + " where url='http://sportsnavi.yahoo.co.jp/sports/soccer/jleague/2013/ranking/32/' "
       + " and xpath=\"//div[@class='mod-content']/table/tr\"";

	/**
	 * Yahooスポーツサイトのhtmlを読み込んで表示する
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
		Ti.App.Analytics.trackPageview('/standingsACL');
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
				for(i=1; i<5; i++) {
					// タグからデータ抽出
					var tdList = dataList[i]["td"];
					var rank = tdList[0].p;
	//				var image = tdList[2].a.img.src;
	                var team;
	                if(tdList[1].div.p[1]) {
	                    team = tdList[1].div.p[1].em;      //海外チーム
	                } else {
	                    team = tdList[1].div.p.em.a.content;   //日本のチーム
	                }
					var point = tdList[2].p;
					var games = tdList[3].p;
					var win = tdList[4].p;
					var draw = tdList[5].p;
					var lose = tdList[6].p;
					var gotGoal = tdList[7].p;
					var lostGoal = tdList[8].p;
					var diff = tdList[9].p;
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
				Ti.API.info('+++++++++++++++++++ YQL終了');
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
module.exports = ACLStandings;
