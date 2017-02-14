/**
 * WebViewを表示するウィンドウ
 * @param {Object} webData
 */
function WebWindow(webData) {
    Ti.API.info('-------------WebWindow. ' + webData.link);
	var util = require("/util/util").util;
    var style = require("/util/style").style;
	var self = Ti.UI.createWindow({
		title: webData.title
		,navBarHidden: true
	});
	var webView = Ti.UI.createWebView({
	    width: Ti.UI.FILL
        ,url: webData.link
	});
	self.add(webView);	

	return self;
};
module.exports = WebWindow;
