var util = require("util").util;
var style = require("style").style;
var customIndicator = require("CustomIndicator").customIndicator;

var win = Ti.UI.currentWindow;
var keyword1 = win.key1;
var keyword2 = win.key2;
// create table view data object
var data = [];
var maxResults = 5;
var startIndex = 1;
var webModal;
var webModalView;
var currentLink;
var textColor = "white";

var indWin = customIndicator.create();
indWin.open();

var tableView = Ti.UI.createTableView({
	data : data,
	backgroundColor : "#000000",
	separatorColor : "#000000",
	top : 2
});

Ti.UI.currentWindow.add(tableView);
tableView.addEventListener('click', function(e) {
	if(e.row.type == "LOAD_MORE") {
		var reloadRow = tableView.data[0].rows.length - 1;
		doYouTubeSearch(keyword1, keyword2);
		tableView.deleteRow(reloadRow);
	} else {
		playYouTube(e.row.videotitle, e.row.guid);
	}
});

/**
 * Youtubeで検索し、一覧表示する。
 */
function doYouTubeSearch(searchTerm1, searchTerm2) {
    Ti.API.info('---------------------------------------------------------------------');
    Ti.API.info(util.formatDatetime() + '  youtube読み込み');
    Ti.API.info('---------------------------------------------------------------------');
	// オンラインチェック
	if(!Ti.Network.online) {
		indWin.close();
		util.openOfflineMsgDialog();
		return;
	}
	var replaceKey = '#キーワード#';
	var searchUrlBase = 'http://gdata.youtube.com/feeds/api/videos?alt=rss&q='
		+ replaceKey
		+ '&max-results=' + maxResults + '&start-index=' + startIndex
		+ '&orderby=published'	//relevance（関連度が高い順）、published（公開日順）、viewCount（再生回数順）、rating（評価が高い順） 
		+ '&v=2';

	var searchUrl = searchUrlBase.replace(replaceKey, searchTerm1);
	var searchUrl2 = null;
	if(searchTerm2) {
		searchUrl2 = searchUrlBase.replace(replaceKey, searchTerm2);
	}
	indWin.open();

	var youtubeFeedQuery = "SELECT title,pubDate,link FROM feed WHERE " 
		+ "url='" + searchUrl + "'";
	if(searchUrl2) {
		youtubeFeedQuery += " or " + "url='" + searchUrl2 + "'";
	}
	Ti.API.info("■YQL Query........" + youtubeFeedQuery);
	
	Ti.Yahoo.yql(youtubeFeedQuery, function(e) {
		try {
			if(e.data == null) {
				indWin.close();
				var row = Ti.UI.createTableViewRow({
					height : 80,
					backgroundSelectedColor : "#f33"
				});
				row.text = style.common.noDataMsg;
				// if(tableView.data[0] && 0 < tableView.data[0].rows.length) {
					// tableView.deleteRow(0);
				// }
				tableView.appendRow(row);
				return;
			}

			for(var v in e.data.item) {
				Ti.API.info('$$$$$$$$$$ ' + v + '=' + e.data.item[v]);
			}
			Ti.API.info('e.data.itemは配列？ ' + (e.data.item instanceof Array));
			var rowsData;
			if(e.data.item instanceof Array) {
				rowsData = e.data.item.map(createYoutubeRow);
			} else {
				rowsData = new Array(createYoutubeRow(e.data.item));
			}
			Ti.API.info('>>>>> map完了');
			// 2回目以降の追加ロード時
			if(tableView.data[0] && 0 < tableView.data[0].rows.length) {
				var lastRow = tableView.data[0].rows.length - 1;
				tableView.deleteRow(lastRow, null);
				var scrollToIdx = tableView.data[0].rows.length;
				for(i=0; i<rowsData.length; i++) {
					if(i == 0) {
						newsInd.hide();
					}
					tableView.appendRow(rowsData[i]);
				}
				tableView.scrollToIndex(scrollToIdx, null);
			} else {
			// 初回ロード時
				tableView.setData(rowsData);
			}
 			startIndex += maxResults;
			
			if(rowsData.length == maxResults) {
	
				// 追加読み込み
				var loadMoreRow = Ti.UI.createTableViewRow(style.news.loadMoreRow);
				// ラベル
			    var loadMoreView = Ti.UI.createView({
			        height: 80,
			        width: 'auto'
			    });
				var loadMoreImg = Ti.UI.createImageView(style.news.loadMoreImg);
				loadMoreLabel = Ti.UI.createLabel(style.news.loadMoreLabel);
				loadMoreLabel.text = 'さらに読み込む...';
				loadMoreView.add(loadMoreImg);
				loadMoreView.add(loadMoreLabel);
				loadMoreRow.add(loadMoreView);
				tableView.appendRow(loadMoreRow);
			}
		} catch(e) {
			indWin.close();
		}
		indWin.close();
	});

	Ti.API.debug("youtube: " + searchUrl);
}

/**
 * TableViewRowを生成して返す
 */
function createYoutubeRow(item/*, index, array*/) {
	Ti.API.info('###### createYoutubeRow() title=' + item.title);
	var title = item.title;

	var summary = "";
	if(item.pubDate) {
		var pubDate = new Date(item.pubDate);
		var minutes = pubDate.getMinutes();
		if(minutes < 10) {
			minutes = "0" + minutes;
		}
		summary = (pubDate.getMonth() + 1) + "/" 
			+ pubDate.getDate() + " " + pubDate.getHours() + ":" + minutes;
	}

	var link = item.link;

	var guid = link.substring(link.indexOf("?v=") + 3);
	guid = guid.substring(0, guid.indexOf("&"));

	var thumbnail = "http://i.ytimg.com/vi/" + guid + "/2.jpg";

	var row = Ti.UI.createTableViewRow({
		height : 80,	//80
//		backgroundSelectedColor : "#f33",
		type : "CONTENT"
	});

	row.url = link;
	row.guid = guid;
	row.videotitle = title;
	row.backgroundColor = "#000000";
	row.color = "#ffffff";

	var labelTitle = Ti.UI.createLabel({
		text : title,
		left : 110,	//105
		right : 10,
		top : 5,
		height : 50,//40
		font : {
			fontSize : 14
		},
		color : "#ffffff"
	});
	row.add(labelTitle);

	var labelSummary = Ti.UI.createLabel({
		text : summary,
		left : 110,	//105
		// top : 45,	//45
		bottom : 9,
		font : {
			fontSize : 13
		},
		color : "#ffffff"
	});
	row.add(labelSummary);

	var img = Ti.UI.createImageView({
		image : thumbnail,
		left : 0,
		height : 80,	//80
		width : 100		//100
	});
	row.add(img);

	return row;
}

/**
 * WEB用ウィンドウを生成して返す。
 * ※WebViewではなく、Window
 */
function createWebView() {
	webModal = Ti.UI.createWindow({
	    barColor: style.common.barColor
	});

	webModal.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT];
	webModalView = Ti.UI.createWebView();
	webModalView.scalesPageToFit = true;
    if (util.isAndroid()) {
        webModalView.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
    }
	webModal.add(webModalView);
	youtubeInd = Ti.UI.createActivityIndicator({
		font: {
			fontSize : 15,
			fontWeight : 'bold'
		},
		color: 'white',
		message: 'Loading videos...'
	});

	webModalView.addEventListener('beforeload', function(e) {
		Ti.API.debug("webview beforeload: " + e.url);
		indWin.open();
	});

	webModalView.addEventListener('load', function(e) {
		Ti.API.debug("webview loaded: " + e.url);
		indWin.close();
	});
	return webModalView;
}

/**
 * 動画を再生する（内部でiPhone/Androidの処理分岐あり）
 */
function playYouTube(vtitle, vguid) {
	if(Ti.Platform.name == 'iPhone OS') {
		var ytVideoSrc = "http://www.youtube.com/v/" + vguid;
		var thumbPlayer = '<html><head><style type="text/css"> h1 { font-family:\'Helvetica\'; font-size:30pt;} body { background-color: black;color: white;} </style></head><body style="margin:0"><h1>' + vtitle + '</h1><center><embed id="yt" src="' + ytVideoSrc + '" type="application/x-shockwave-flash" width="100%" height="75%"></embed></center></body></html>';

		showHTMLContent(vtitle, 'http://www.youtube.com/watch?v=' + vguid, thumbPlayer);
	} else {
		Ti.Platform.openURL('http://www.youtube.com/watch?v=' + vguid);
	}
}

/**
 * modalウィンドウにhtmlを表示する
 * ※iOSで動画再生時にも使用
 */
function showHTMLContent(wTitle, wUrl, wHTMLContent) {
	//Ti.API.debug("loading html web view content: " + wHTMLContent);

	currentLink = wUrl;

	createWebView();

	webModal.title = wTitle;

	Ti.UI.currentTab.open(webModal, {
		animated : true
	});

	webModalView.html = wHTMLContent;

};

doYouTubeSearch(keyword1, keyword2);
