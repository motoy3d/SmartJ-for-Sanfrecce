var config = require("/config").config;
var style = require("util/style").style;
var checkapp = null;
var androidDisplay = null;
if(Ti.Platform.osname == "android"){
    checkapp = require('com.motoy3d.check.app.android');
    androidDisplay = require("com.motoy3d.android.displayinfo");
}
exports.util = {
	/**
	 * 現時点の表示対象シーズン(年)を返す。
	 */
	getCurrentSeason : function() {
		// 2/1～1月末までを1シーズンとする
		var now = new Date();
		var year = now.getFullYear();
		var month = now.getMonth();
		if(month == 0) {
			year--;
		}
		return year;
	},
	/**
	 * 文字列(expression)中の指定文字列(org)をdestに置換する
	 */
	replaceAll : function(expression, org, dest) { 
		return expression.split(org).join(dest);  
	},
	/**
	 * 文字列のendsWidth
	 */
	endsWith : function(text, suffix, isIgnoreCase) {
		var sub = text.length - suffix.length;
		if(isIgnoreCase) {
			text = text.toLowerCase();
			suffix = suffix.toLowerCase();
		}
		return (sub >= 0) && (text.lastIndexOf(suffix) === sub);
	},
	/**
	 * 文字列を指定バイト数以下にカットして返す
	 */
	cutToByteLength : function(text, byteLen) {
	    var count = 0;
	    var result = "";
        for (i=0; i<text.length; i++) {
            var ch = text.charAt(i);
            var escChar = escape(ch);
            if (escChar.length < 4) count++; else count+=2;
            result += ch;
            if(byteLen < count) {
                return result;
            }
        }
        return text;
	},
	/**
	 * メッセージダイアログを表示する 
	 */
	showMsg : function(msg) {
		Ti.UI.createAlertDialog({title: "", message: msg}).show();
	},
	/**
	 * オフラインメッセージダイアログを表示する
	 */
	openOfflineMsgDialog : function() {
		var dialog = Ti.UI.createAlertDialog({
			message : style.common.offlineMsg,
			buttonNames : ["OK"]
		});
		dialog.show();		
	},
	/**
	 * 画面の向きがポートレートの場合に真を返す
	 */
	isPortrait : function() {
	    var width = Ti.Platform.displayCaps.platformWidth;
	    var height = Ti.Platform.displayCaps.platformHeight;
		return width < height;		
	},
	/**
	 * 指定ミリ秒スリープする 
	 */
	sleep : function(milliseconds) {
		var start = new Date().getTime();
 		while((new Date().getTime() - start) < milliseconds) {
			// Do nothing
		}	
	},
	/**
	 * チーム名を正式名から簡略形式で返す。
	 */
	getSimpleTeamName : function(teamName) {
		if(teamName == 'ベガルタ仙台') return '仙台';	
		else if(teamName == 'サンフレッチェ広島') return '広島';	
		else if(teamName == 'ジュビロ磐田') return '磐田';	
		else if(teamName == '清水エスパルス') return '清水';	
		else if(teamName == '浦和レッズ') return '浦和';	
		else if(teamName == 'FC東京') return 'FC東京';	
		else if(teamName == '川崎フロンターレ') return '川崎';	
		else if(teamName == 'サガン鳥栖') return '鳥栖';	
		else if(teamName == '横浜F・マリノス') return '横浜FM';	
		else if(teamName == '鹿島アントラーズ') return '鹿島';	
		else if(teamName == 'セレッソ大阪') return 'C大阪';	
		else if(teamName == '柏レイソル') return '柏';	
		else if(teamName == '名古屋グランパス') return '名古屋';	
		else if(teamName == 'ヴィッセル神戸') return '神戸';	
		else if(teamName == '大宮アルディージャ') return '大宮';	
		else if(teamName == 'ガンバ大阪') return 'G大阪';	
		else if(teamName == 'アルビレックス新潟') return '新潟';	
		else if(teamName == 'コンサドーレ札幌') return '札幌';
        else if(teamName == 'ヴァンフォーレ甲府') return '甲府';
        else if(teamName == '湘南ベルマーレ') return '湘南';
        else if(teamName == '大分トリニータ') return '大分';
        else if(teamName == '京都サンガF.C.') return '京都';
        else if(teamName == 'ジェフユナイテッド千葉') return '千葉';
        else if(teamName == '東京ヴェルディ') return '東京V';
        else if(teamName == 'モンテディオ山形') return '山形';
        else if(teamName == '横浜FC') return '横浜FC';
        else if(teamName == '栃木FC') return '栃木';
        else if(teamName == 'ギラヴァンツ北九州') return '北九州';
        else if(teamName == 'ファジアーノ岡山') return '岡山';
        else if(teamName == '水戸ホーリーホック') return '水戸';
        else if(teamName == '松本山雅FC') return '松本山雅';
        else if(teamName == '徳島ヴォルティス') return '徳島';
        else if(teamName == 'ザスパクサツ群馬') return '群馬';
        else if(teamName == 'ロアッソ熊本') return '熊本';
        else if(teamName == 'アビスパ福岡') return '福岡';
        else if(teamName == '愛媛FC') return '愛媛';
        else if(teamName == 'FC岐阜') return '岐阜';
        else if(teamName == 'カターレ富山') return '富山';
        else if(teamName == 'ガイナーレ鳥取') return '鳥取';
        else if(teamName == 'FC町田ゼルビア') return '町田';
        else if(teamName == 'ツエーゲン金沢') return '金沢';
        else if(teamName == 'AC長野パルセイロ') return '長野';
        else if(teamName == 'グルージャ盛岡') return '盛岡';
        else if(teamName == 'SC相模原') return '相模原 ';
        else if(teamName == 'FC琉球') return '琉球';
        else if(teamName == '福島ユナイテッドFC') return '福島';
        else if(teamName == 'ブラウブリッツ秋田') return '秋田';
        else if(teamName == 'Jリーグ・アンダー22選抜') return 'J-22';
        else if(teamName == '藤枝MYFC') return '藤枝';
        else if(teamName == 'Y.S.C.C.横浜') return 'YS横浜';
        else if(teamName == ' V・ファーレン長崎') return '長崎';
        else if(teamName == 'カマタマーレ讃岐') return '讃岐';
    },
	/**
	 * ゼロパディング 
	 */
	zeroPad : function(str, length) {
	    return new Array(length - ('' + str).length + 1).join('0') + str;
	},
	/**
	 * 日付をフォーマットする 
	 */
    formatDate : function(date) {
        var zeroPad = function(str, length) {
            return new Array(length - ('' + str).length + 1).join('0') + str;
        };
        if(!date) {
            date = new Date();
        }
        var datestr = '' + (1900 + date.getYear())+'/'+ zeroPad(date.getMonth()+1, 2) 
            + "/" + zeroPad(date.getDate(), 2);
        return datestr;
    },	
    /**
     * 日時をフォーマットする 
     */
    formatDatetime : function(date) {
        var zeroPad = function(str, length) {
            return new Array(length - ('' + str).length + 1).join('0') + str;
        };
        if(!date) {
            date = new Date();
        }
        var datestr = '' + (1900 + date.getYear())+'/'+ zeroPad(date.getMonth()+1, 2) 
            + "/" + zeroPad(date.getDate(), 2)
            + "  " + zeroPad(date.getHours(), 2) + ":" + zeroPad(date.getMinutes(), 2);
        return datestr;
    },  
    /**
     * 日時分秒ミリ秒をフォーマットする 
     */
    formatDatetime2 : function(date) {
        var zeroPad = function(str, length) {
            return new Array(length - ('' + str).length + 1).join('0') + str;
        };
        if(!date) {
            date = new Date();
        }
        var datestr = '' + (1900 + date.getYear())+'/'+ zeroPad(date.getMonth()+1, 2) 
            + "/" + zeroPad(date.getDate(), 2)
            + "  " + zeroPad(date.getHours(), 2) + ":" + zeroPad(date.getMinutes(), 2)
            + ":" + zeroPad(date.getSeconds(), 2) + "." + date.getMilliseconds();
        return datestr;
    },  
    /**
     *  日付のパースして現在からのどのくらい前かを返す。例：「３分前、５時間前、2日前」
     */
    parseDate2 : function(str) {
        var c = Date.parse(str);
        if (typeof c === 'number'){
            var n = new Date().getTime();
            var s = Math.floor((n-c) / 1000);
            if (s<60)                                   return s + '秒前';
            else if (s>=60 && s<60*60)                      return [Math.floor(s/60), '分前'].join('');
            else if (s>=60*60 && s<60*60*24)                return [Math.floor(s/60/60), '時間前'].join('');
            else if (s>=60*60*24 && s<60*60*24*30)          return [Math.floor(s/60/60/24), '日前'].join('');
            else if (s>=60*60*24*30 && s<60*60*24*30*365)   return [Math.floor(s/60/60/24/30), 'ヶ月前'].join('');
            else if (s>=60*60*24*30*365)                    return [Math.floor(s/60/60/24/30/365), '年前'].join('');
        }        return "";
    },
    // 日付のパース
    parseDate : function(str){// str==yyyy-mm-ddThh:mm:ssZ
        //strdate==YYYY/mm/dd hh:mm:ss
        var strDate = str.split('\+')[0].replace('T',' ').replace('-','\/').replace('-','\/').replace('Z','');
        var date = new Date(strDate);
        var time = date.getTime() + 32400000;
        date.setTime(time);
        return date;
    },
    /**
     * 文字列を置換する 
     */
    replaceAll : function(expression, org, dest) {
        return expression.split(org).join(dest);
    },
    /**
     *不要な文字列（タグや制御文字）を削除して返す 
     */
    deleteUnnecessaryText : function(text) {
        var replaceAll = function(expression, org, dest) { 
            return expression.split(org).join(dest);
        };
        if(text) {
            text = text.replace(/\n\n/g, "\n");
            text = replaceAll(text, "<b>", "");
            text = replaceAll(text, "</b>", "");
            text = replaceAll(text, "<br><br><br>", " ");
            text = replaceAll(text, "<br><br>", " ");
            text = replaceAll(text, "<br>", " ");
            text = replaceAll(text, "<br/><br/><br/>", " ");
            text = replaceAll(text, "<br/><br/>", " ");
            text = replaceAll(text, "<br/>", " ");
            text = replaceAll(text, "&amp;", "&");
            text = replaceAll(text, "&quot;", '"');
            text = replaceAll(text, "&#39;", "'");
        }
        return text;
    },
    /**
     * アイコンやアフィリエイト等の不要な画像の場合にtrueを返す
     */
    isUnnecessaryImage : function(imgUrl) {
        var endsWith = function(text, suffix) {
            var sub = text.length - suffix.length;
            return (sub >= 0) && (text.lastIndexOf(suffix) === sub);
        };
        if(endsWith(imgUrl, ".gif") ||
            imgUrl.indexOf("http://hbb.afl.rakuten.co.jp") == 0 ||
            imgUrl.indexOf("http://counter2.blog.livedoor.com") == 0 ||
            imgUrl.indexOf("fbcdn") != -1 || //facebook(直接表示できない)
            imgUrl.indexOf("http://measure.kuchikomi.ameba.jp") == 0 || //ameba
            imgUrl.indexOf("rssad") != -1 || //rssad(直接表示できない)
            endsWith(imgUrl, "money_yen.png") ||  //浦和フットボール通信
            endsWith(imgUrl, "/btn_share_now.png") || //なう
            endsWith(imgUrl, "/btn_share_mixi.png")  //mixi
        ) {
            return true;
        }
        return false;
    },
    /**
     * 配列に値が含まれるかどうかを返す
     */
    contains : function(array, item) {
        for(var i in array) {
            if(array[i] == item) {
                return true;
            }
        }
        return false;
    },
    /**
     * itemが配列内の値で始まるものが含まれるかどうかを返す
     */
    containsStartsWith : function(array, item) {
    	if (array) {
	        for(var i in array) {
	            if(item.indexOf(array[i]) == 0) {
	                return true;
	            }
	        }
		}
        return false;
    },
    /**
     * オブジェクトを文字列化して返す 
     */
    toString : function(obj) {
        var s = '';
        if(obj) {
            for(v in obj) {
                s += "   " + v + "=" + obj[v];
            }
            return s;
        } else {
            return obj;
        } 
    },
    /**
     * 改行を削除して返す 
     */
    removeLineBreak : function(text) {
        Ti.API.info('>>>>>>>>> text=' + text);
        if(!text) {
            return text;
        }
        text = text.replace((new RegExp("\r\n","g")),"");
        text = text.replace((new RegExp("\n","g")),"");
        text = text.replace((new RegExp("<br>","g")),"");
        text = text.replace((new RegExp("<br/>","g")),"");
        return text;
    },
    /**
     * TweetのURLとハッシュタグにアンカータグを埋め込んで返す 
     */
    tweetTrimer : function(t) {
    
        var text = t;
        var twitterPath = 'http://twitter.com/#!/';
        
        var patternHash = /(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_\/>]+)[#＃]([ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z]+[ー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9_]*)/;
        var patternName = /(?:^|[^ーー゛゜々ヾヽぁ-ヶ一-龠ａ-ｚＡ-Ｚ０-９a-zA-Z0-9&_\/>]+)@([a-zA-Z0-9_]+)/;
        var patternLink = /(http[s]?:\/\/)?([a-zA-Z0-9_]+)(\.[a-zA-Z0-9_\/\.?=]+)/g;
    
        var matchesLink = text.match( patternLink );
        if ( matchesLink != null ) {
            for ( var i = 0; i < matchesLink.length; i++ ) {
                text = text.replace( matchesLink[i], '<a href="' + ( ( RegExp.$1 != null ) ? '' : 'http://' ) + matchesLink[i] + '" target="_blank" class="twitter-intext-link">' + matchesLink[i] + '</a>' );
            }
        }
        
        var matchesHash;
        var matchesName;
        while ( true ) {
            var flgAllReplaced = true;
            if ( ( matchesHash = patternHash.exec( text ) ) != null ) {
                text = text.replace( patternHash, ' <a href="' + twitterPath + 'search?q=%23' + RegExp.$1 + '" target="_blank" class="twitter-intext-link">#' + RegExp.$1 + '</a>' ); 
                flgAllReplaced = false;
            }
            if ( ( matchesName = patternName.exec( text ) ) != null ) {
                text = text.replace( patternName, ' <a href="' + twitterPath + RegExp.$1 + '" target="_blank" class="twitter-intext-link">@' + RegExp.$1 + "</a>" ); 
                flgAllReplaced = false;
            }
            if ( flgAllReplaced ) break;
        }
    
        return text;
    },
    /**
     * Android 
     */    
    isAndroid : function() {
        return (Ti.Platform.osname === 'android');
    },
    /**
     * iOS
     */    
    isiOS : function(){
        return (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad');
    },    
    /**
     * iPhone
     */    
    isiPhone : function(){
        return (Ti.Platform.osname === 'iphone');
    },    
    /**
     * iPad
     */    
    isiPad : function(){
        return (Ti.Platform.osname === 'ipad');
    },    
    /**
     * iOS6以上 
     */    
    isiOS6Plus : function()
    {
        // add iphone specific tests
        if (Titanium.Platform.name == 'iPhone OS')
        {
            var version = Titanium.Platform.version.split(".");
            var major = parseInt(version[0],10);
            
            // can only test this support on a 3.2+ device
            if (major >= 6)
            {
                return true;
            }
        }
        return false;
    },
    /**
     * iOS7以上 
     */    
    isiOS7Plus: function()
    {
        // add iphone specific tests
        if (Titanium.Platform.name == 'iPhone OS')
        {
            var version = Titanium.Platform.version.split(".");
            var major = parseInt(version[0],10);
            
            // can only test this support on a 3.2+ device
            if (major >= 7)
            {
                return true;
            }
        }
        return false;
    },
    /**
     * アプリストアのURLを返す。
     */
    getAppUrl : function() {
        if (Titanium.Platform.name == 'android') {
            return config.androidAppUrl;
        } else {
            return config.iPhoneAppUrl;
        }
    },
    /**
     * Twitter/Facebook/LINEの公式アプリにテキストを引き渡す。
     * @packageName
     * @activityClassName
     */
    sendToApp : function(packageName, activityClassName, text) {
        var intent = Ti.Android.createIntent({
             action: Ti.Android.ACTION_SEND,
             packageName: packageName,
             className: activityClassName,
             flags: Ti.Android.FLAG_ACTIVITY_NEW_TASK,
             type: "text/plain"
         });
         var text;
         intent.putExtra(Ti.Android.EXTRA_TEXT, text); //twitter supports any kind of string content (link, text, etc)
         Ti.API.info("package=" + packageName + ", class=" + activityClassName + ', text=' + text);
         Ti.Android.currentActivity.startActivityForResult(intent, function(e) {
             try {
                 Ti.API.info(packageName + ' >>>>>>>>>>>>>>>>result =   ' + e.resultCode);
             } catch(e) {
                 Ti.API.error("sendToAppエラー1： " + e);
             }
         });
    },
    /**
     * [Android] アプリがインストールされている場合にtrueを返す。
     * @param {Object} packageName
     */
    isAppInstalled : function(packageName) {
        try {
            return checkapp.exists(packageName);
        } catch(e) {
            Ti.API.info('isAppInstalledエラー： ' + e);
            return false;
        }
    },
    /**
     * [Android] ディスプレイ情報を返す
     * @param {Object} packageName
     */
    getDpi : function() {
        if(Ti.Platform.osname === 'android') {
            try {
                return androidDisplay.densityDpi;
            } catch(e) {
                Ti.API.info('getDpiエラー： ' + e);
                return false;
            }
        } else {
            return "";
        }
    },
    /**
     * [Android] twitterインテントのクラス名を返す
     */
    getTwitterClass : function() {
        if(Ti.Platform.osname === 'android') {
            try {
                return androidDisplay.twitterClass;
            } catch(e) {
                Ti.API.info('getTwitterClassエラー： ' + e);
                return false;
            }
        } else {
            return "";
        }
    }
};