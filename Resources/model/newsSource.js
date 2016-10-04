var util = require("util/util").util;
var siteNameMaxByteLength = 26;
var sites = new Array();
var idx = 0;
//sites[idx++] = new Array("浦和レッズオフィシャル","http://www.urawa-reds.co.jp");
//sites[idx++] = new Array("梅崎司 オフィシャルブログ","http://ameblo.jp/tsukasa-umesaki");
//sites[idx++] = new Array("柏木陽介 オフィシャルブログ","http://ameblo.jp/yosuke-kashiwagi");
//sites[idx++] = new Array("サッカーキング","http://www.soccer-king.jp");
sites[idx++] = new Array("サポティスタ","http://supportista.jp");
//sites[idx++] = new Array("スポーツナビ","http://rd.yahoo.co.jp/rss/l/spnavi");
//sites[idx++] = new Array("日刊スポーツ","http://www.nikkansports.com");
//sites[idx++] = new Array("サンスポ","http://www.sanspo.com");
//sites[idx++] = new Array("J's Goal","http://www.jsgoal.jp");
//sites[idx++] = new Array("livedoor","http://news.livedoor.com");
sites[idx++] = new Array("サッカーコラム J3 Plus+","http://llabtooflatot.blog102.fc2.com");
//sites[idx++] = new Array("ＦＣＫＳＡ５５","http://kodahima.blog71.fc2.com");
sites[idx++] = new Array("蹴閑ガゼッタ","http://gazfootball.com");
//sites[idx++] = new Array("J Sports","http://www.jsports.co.jp");
//sites[idx++] = new Array("地球は青い","http://www.plus-blog.sportsnavi.com/redine");
sites[idx++] = new Array("浦和御殿","http://redsnowman.cocolog-nifty.com/urawa_goten");
//sites[idx++] = new Array("浦和レッズの逆襲日報","http://redsgyakushuu.blog.shinobi.jp");
sites[idx++] = new Array("しみマガブログ","http://kaizokuo.blog5.fc2.com/");
sites[idx++] = new Array("徒然フットボール","http://blogs.yahoo.co.jp/dukaeeq2004");
sites[idx++] = new Array("湯浅健二のサッカー・ホームページ","http://www.yuasakenji-soccer.com/");
sites[idx++] = new Array("ゲキサカ","http://web.gekisaka.jp");
//sites[idx++] = new Array("Sportiva", "http://sportiva.shueisha.co.jp/");

/**
 * ＵＲＬから、サイト名を取得する
 */
exports.getSiteName = function(url) {
	Ti.API.info('   getSiteName. ' + url);
	if(!url) {
		return "";
	}
	for(i=0; i<sites.length; i++) {
		if(url.indexOf(sites[i][1]) != -1) {
			return sites[i][0];
		}
	}

	return "";
};

/**
 * サイト名を最適化する
 * ※不要な部分を削除する
 */
exports.optimizeSiteName = function(siteName) {
	// Googleアラート, Yahoo Pipes
	if(siteName.indexOf("Google") == 0 ||
		siteName.indexOf("Pipes Output") == 0) {
		return "";
	}
	siteName = util.deleteUnnecessaryText(siteName);
    siteName = util.replaceAll(siteName, "Powered by Ameba", "");
    siteName = util.replaceAll(siteName, "浦和レッドダイヤモンズ", "浦和レッズ");
    siteName = unescape(siteName);
    siteName = util.cutToByteLength(siteName, siteNameMaxByteLength);
	return siteName;
};
