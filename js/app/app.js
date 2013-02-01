var Game = Game || {};

Game.READY = "Play";
Game.RUNNING = "Reveal Tiles";
Game.STOPPED = "Revealed/Re-play";
Game.GAMEOVER = "Play Again";
Game.LEVEL1 = 1;
Game.LEVEL2 = 2;
Game.LEVEL3 = 3;
Game.LEVEL4 = 4;

Game.THEMESOCIAL = "Social";
Game.THEMEWEB = "Web";
Game.THEMETEXT = "Text";



$(function() {
	
	setTimeout(function(){new Game.GameView()}, 100);

});