var Game = Game || {};

Game.READY = "Start";
Game.RUNNING = "Running";
Game.STOPPED = "Stopped";
Game.GAMEOVER = "GameOver"
Game.REVEAL = "Reveal";
Game.REVEALED = "Revealed";
Game.LEVEL1 = 1;
Game.LEVEL2 = 2;
Game.LEVEL3 = 3;
Game.LEVEL4 = 4;

Game.THEMESOCIAL = "Social";
Game.THEMEWEB = "Web";
Game.THEMETEXT = "Text";



$(function() {
	
	new Game.GameView();

	$("#theme").dropdown( {
					gutter : 5
				} );
	
});