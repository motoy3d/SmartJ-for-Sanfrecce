function ApplicationTabGroup() {
	var NewsWindow = require('ui/handheld/NewsWindow');
	var ResultsWindow = require('ui/handheld/ResultsWindow');
	var StandingsWindow = require('ui/handheld/StandingsWindow');
	var TwitterWindow = require('ui/handheld/TwitterWindow');
    var style = require("util/style").style;
    var util = require("util/util").util;
	//create module instance
	var self = Ti.UI.createTabGroup();
	if(util.isAndroid()) {
	    self.applyProperties(style.tabsAndroid);
	}
	
	//create app tabs
	var win1 = new NewsWindow(self),
		win2 = new ResultsWindow(self),
		win3 = new StandingsWindow(self),
		win4 = new TwitterWindow(self, "searchTweets"),
        win5 = new TwitterWindow(self, "playerTweets")
		;
	// ニュース
	var tab1 = Ti.UI.createTab({
		title: util.isAndroid()? "" : "ニュース",
		icon: '/images/news.png',
		window: win1
	});
	// 日程・結果
	var tab2 = Ti.UI.createTab({
		title: util.isAndroid()? "" : "日程・結果",
		icon: '/images/game.png',
		window: win2
	});
	win2.containingTab = tab2;
	// 順位表
	var tab3 = Ti.UI.createTab({
		title: util.isAndroid()? "" : "順位表",
		icon: '/images/standings.png',
		window: win3
	});
	win3.containingTab = tab3;
	// みんなのツイート
	var tab4 = Ti.UI.createTab({
		title: util.isAndroid()? "" : "twitter",
		icon: '/images/twitter.png',
		window: win4
	});
	win4.containingTab = tab4;
    // 選手のツイート
    var tab5 = Ti.UI.createTab({
        title: util.isAndroid()? "" : "選手+α",
        icon: '/images/playerTweet.png',
        window: win5
    });
    win5.containingTab = tab5;
	
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	self.addTab(tab4);
	self.addTab(tab5);
    
	return self;
};

module.exports = ApplicationTabGroup;
