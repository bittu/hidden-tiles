var Game = Game || {};

$(function( $ ) {
	'use strict';
	
	Game.GameView = Backbone.View.extend({
		
		el: "#tilesGame",
		
		model: new Game.GameModel,
		
		tileTemplate: _.template( $('#tileTemplate').html() ),

		startButtonTemplate: _.template( $('#startButtonTemplate').html() ),

		optionsTemplate: _.template( $('#optionsTemplate').html() ),
		
		events: {
			'click #start': 'startGame',
			'change input[name=level]': 'changeLevel',
			'change input[name=theme]': 'changeTheme',
			'click .panel': 'flipTile'
		},
		
		initialize: function() {
			_.bindAll(this);
			this.$layerContainer = this.$("#layerContainer");
			this.$tilesContainer = this.$("#tilesContainer");
			this.$startDiv = this.$("#startDiv");
			this.$options = this.$("#options");
			this.$gameOverLayer = this.$("#gameOverLayer");
						
			this.render();
		},
		
		render: function() {			

			this.$gameOverLayer.hide();
			this.$tilesContainer.show();

			this.renderStartButton();
			this.$options.html(this.optionsTemplate(this.model.toJSON()));
			$( '#level' ).dropdown( {
				gutter : 5,
				delay : 100,
				random : true,
				themeClass: "level"
			} );
			$( '#theme' ).dropdown( {
				gutter : 5,
				delay : 40,
				rotated : 'left',
				themeClass: "theme"
			} );
			var level = this.model.get("Level");
			var size = this.model.get("GameSizes")[level];
			var containerSize = this.model.get("ContainerSizes")[level];
			var noOfTiles = size * size;
			this.$tilesContainer.css({width : containerSize});
			this.$layerContainer.height(containerSize);
			var tilesContainerHTML = "";
			var theme = this.model.get("Theme");
			var themeData = this.model.get("ThemeData")[theme];
			themeData = Game.pickRandom(themeData);
			themeData = themeData.slice(0, size);
			
			var tilesContainerArray = [];

			for(var i = 0, j = 0; i < noOfTiles; i++, j++) {				
				if(j > size-1) j = 0;				
				tilesContainerArray.push( this.tileTemplate({dataTile: themeData[j]}));				
			}

			tilesContainerArray = Game.pickRandom(tilesContainerArray);			

			this.$tilesContainer.html(tilesContainerArray.join(''));

			this.$start = this.$("#start");
			this.$clicks = this.$("#clicks");
			this.$timer = this.$("#timer");
			this.$pairs = this.$("#pairs");
			this.$level = this.$("input[name=level]");
			this.$theme = this.$("input[name=theme]");
			this.$panel = this.$(".panel");
		},

		renderStartButton: function() {
			this.$startDiv.html(this.startButtonTemplate(this.model.toJSON()));
		},

		startGame: function() {
			var GameStatus = this.model.get("GameStatus");
			
			if(GameStatus === Game.READY){
				this.model.set({GameStatus: Game.RUNNING});
				this.renderStartButton();
				Game.Timer.start();
			}
			else if(GameStatus === Game.RUNNING) {
				this.revealTiles();
			}
			else if(GameStatus === Game.STOPPED || GameStatus === Game.GAMEOVER) {
				this.resetGame();
				Game.Timer.start();
			}			
		},
		
		resetGame: function() {
			this.model.set(this.model.defaults);
			this.model.set({GameStatus: Game.RUNNING, 
							Level: parseInt(this.$level.val()),
							Theme: this.$theme.val()});
			this.render();
			Game.Timer.reset();
		},
		
		revealTiles: function() {
			this.model.set({GameStatus: Game.STOPPED});
			this.renderStartButton();
			this.$panel.addClass("flip");
			Game.Timer.stop();
		},
		
		changeLevel: function(event) {
			this.model.set({Level: parseInt(this.$level.val())});
			this.model.set({GameStatus: Game.READY});
			this.render();
			Game.Timer.reset();
		},
		
		changeTheme: function() {
			this.model.set({Theme: this.$theme.val()});
			this.model.set({GameStatus: Game.READY});
			this.render();
			Game.Timer.reset();
		},
		
		flipTile: function(event) {			
			var GameStatus = this.model.get("GameStatus");
			if(GameStatus === Game.READY || GameStatus === Game.STOPPED)
				return;
			var $this = $(event.currentTarget);
			if($this.hasClass("flip"))
				$this.removeClass("flip");
			else
				$this.addClass("flip");
			this.updateClicksCount("add");
			setTimeout(this.matchTiles, 500);
		},

		matchTiles: function() {
			var flippedTiles = $(".flip");			
			if(flippedTiles.length > 1) {
				if($(flippedTiles[0]).data("tile") === $(flippedTiles[1]).data("tile")) {
					this.dissolveTiles();
					this.updateClicksCount("minus");
					this.updatePairsDone();
					if(this.isGameOver()) {
						Game.Timer.stop();
						this.$gameOverLayer.show();
						this.$tilesContainer.hide();
						this.model.set({GameStatus: Game.GAMEOVER});
						this.renderStartButton();
					}

				}
				else {
					this.flipBackTiles();					
				}
			}
		},

		updateClicksCount: function(addOrMinus) {
			var count = this.model.get("ClicksCount");
			this.model.set({ClicksCount: (addOrMinus==="add")?count+1:count-1});
			this.$clicks.text(this.model.get("ClicksCount"));
		},

		updatePairsDone: function() {
			var count = this.model.get("PairsDone");
			this.model.set({PairsDone: count+1});
			this.$pairs.text(this.model.get("PairsDone"));
		},

		dissolveTiles: function() {
			$(".flip").removeClass("flip").addClass("dissolve");
		},

		flipBackTiles: function() {
			$(".flip").removeClass("flip");
		},

		isGameOver: function() {
			if(this.$panel.not(".dissolve").length > 0)
				return false;
			return true;
		}

	});
	
	Game.pickRandom = function(array) {
		if(array) {
		      var tmp, current, top = array.length;
		    
		      if(top) while(--top) {
		        current = Math.floor(Math.random() * (top + 1));
		        tmp = array[current];
		        array[current] = array[top];
		        array[top] = tmp;
		      }
		    }
      return array;
	}

	var curTime;

	Game.Timer = {

		interval: 50,

		started: false,

		elapsed: 0,

		pad: function(num) {
			if (num < 10) return "0" + num;
			return num;
		},

		update: function(elapsed) {
			Game.Timer.elapsed = elapsed;
			var secs = Math.floor(elapsed / 1000);
			var mins = Math.floor(secs / 60);
			var hours = Math.floor(secs / ( 60 * 60 ) );
			var secs = secs % 60;
			var csecs = Math.floor(elapsed % 1000 / 10);
			
			$("#timer").html(Game.Timer.pad(hours) + ":" 
				+ Game.Timer.pad(mins) + ":" + Game.Timer.pad(secs) 
				+ "." + Game.Timer.pad(csecs));
		},

		onTimer: function() {
			
			if (Game.Timer.started) {
				
				curTime = new Date();
				
				Game.Timer.update(curTime.valueOf() - Game.Timer.startTime.valueOf());
			}
		},

		start: function() {

			Game.Timer.started = true;			
			
			curTime = new Date();
			Game.Timer.startTime = new Date(curTime.valueOf() - Game.Timer.elapsed);
			
			Game.Timer.timerInterval = window.setInterval(Game.Timer.onTimer, Game.Timer.interval);

		},



		stop: function() {
			Game.Timer.started = false;
			window.clearInterval(Game.Timer.timerInterval);
		},

		reset: function() {
			Game.Timer.stop();
			Game.Timer.update(0);
		}

	}
});