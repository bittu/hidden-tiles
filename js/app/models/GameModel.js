var Game = Game || {};

$(function( $ ) {
	'use strict';

	Game.GameModel = Backbone.Model.extend({
		defaults: {			
			GameStatus: Game.READY,
			RevealStatus: Game.REVEAL,
			ClicksCount: 0,
			Timer: "00:00:00.00",
			PairsDone: 0,
			Level: Game.LEVEL2,
			Theme: Game.THEMESOCIAL,
			GameSizes: {"1" : "4", "2" : "6", "3" : "8", "4" : "10"},
			ThemeData: {"Social": [
							"icon-facebook", "icon-twitter", "icon-github", "icon-linkedin", "icon-google-plus", 
							"icon-phone", "icon-pinterest", "icon-sign-blank", "icon-github-alt", "icon-github-sign"
							],
						"Web": [
							"icon-spinner", "icon-share", "icon-shopping-cart", "icon-map-marker", "icon-signin",
							"icon-signout", "icon-sitemap", "icon-time", "icon-check", "icon-calendar"
							],
						"Text": [
							"icon-file", "icon-cut", "icon-copy", "icon-paste", "icon-save",
							"icon-undo", "icon-repeat", "icon-font", "icon-bold", "icon-italic"
							]
								},
			ContainerSizes: {"1" : "200px", "2": "300px", "3": "400px", "4": "500px"}
		}
  });
});