/**
 * 順位表取得サービス
 */
function Standings(compe) {
    var config = require("/config").config;
	var util = require("util/util").util;
    var style = require("util/style").style;
    var XHR = require("util/xhr");
	var self = {};
	self.load = load;

    var standingsUrl = config.standingsUrl + "?season=" + util.getCurrentSeason() + "&teamId=" + config.teamId;
    Ti.API.info('★URL=' + standingsUrl);
    if (!compe) {
        compe = "J";
    }
    standingsUrl += "&compe=" + compe;
    
	/**
	 * 自前サーバからJSONを読み込んで表示する
	 */
	function load(sort, callback) {
        var before = new Date();
	    Ti.API.info('---------------------------------------------------------------------');
	    Ti.API.info(util.formatDatetime() + '  順位表読み込み');
        Ti.API.info('---------------------------------------------------------------------');
        
		// オンラインチェック
		if(!Ti.Network.online) {
            //callback.fail(style.common.offlineMsg);
            //TODO return;
		}
        if(sort) {
            Ti.App.Analytics.trackPageview('/standings?compe=' + compe + '&sort=' + sort);
        } else {
            Ti.App.Analytics.trackPageview('/standings?compe=' + compe);
        }
        var xhr = new XHR();
        // Normal plain old request with a 5mins caching
        if(sort){
            standingsUrl += "&sort=" + sort;
        }
        Ti.API.info('URL=' + standingsUrl);
        xhr.get(standingsUrl, onSuccessCallback, onErrorCallback, { ttl: 1 });
        function onSuccessCallback(e) {
            // Handle your request in here
            // the module will return an object with two properties
            // data (the actual data retuned
            // status ('ok' for normal requests and 'cache' for requests cached
            Ti.API.info("e.status==" + e.status);
            // 
            if(!e.data) {
                var month = new Date().getMonth() + 1;
                if(month == 2) {
                    // 新シーズン開始前
                    callback.fail("新シーズンの開幕までお待ちください");
                } else {
                    callback.fail(style.common.loadingFailMsg);
                }
                return;
            }
            try {
                var dataList = JSON.parse(e.data);
                var standingsDataList = new Array();
                for(i=0; i<dataList.length; i++) {
                    var ranking = dataList[i];
                    var rank = ranking.rank;
                    var teamId = ranking.team_id;
                    var team = util.getSimpleTeamName(ranking.team_name);
                    if (!team){
                        team = ranking.team_name;
                    }
                    var teamFull = ranking.team_name;
                    var point = ranking.point;
                    var win = ranking.win;
                    var draw = ranking.draw;
                    var lose = ranking.lose;
                    var gotGoal = ranking.got_goal;
                    var lostGoal = ranking.lost_goal;
                    var diff = ranking.diff;
                    Ti.API.debug(rank + ' : ' + team + ' : ' + point);
                    
                    var standingsData = {
                        rank: rank
                        ,teamId: teamId
                        ,team: team
                        ,teamFull: teamFull
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
            } catch(ex) {
                Ti.API.error('---------------------\n' + ex);   
                callback.fail(style.common.loadingFailMsg);
            } finally {
                var after = new Date();
                Ti.API.info("Standings.js#load() 処理時間★　" 
                    + (after.getTime()-before.getTime())/1000.0 + "秒");
            }
        };
        function onErrorCallback(e) {
            Ti.API.error(e);
        }
	}
	return self;
}
module.exports = Standings;
