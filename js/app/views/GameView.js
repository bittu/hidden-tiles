var Game = Game || {};

$(function( $ ) {
	'use strict';
	
	Game.GameView = Backbone.View.extend({
		
		el: "#tilesGame",
		
		model: new Game.GameModel,
		
		tileTemplate: _.template( $('#tileTemplate').html() ),

		startButtonTemplate: _.template( $('#startButtonTemplate').html() ),

		revealButtonTemplate: _.template( $('#revealButtonTemplate').html() ),

		optionsTemplate: _.template( $('#optionsTemplate').html() ),
		
		events: {
			'click #start': 'startGame',
			'click #reveal': 'revealTiles',
			'change #level': 'changeLevel',
			'change #theme': 'changeTheme',
			'click .panel': 'flipTile'
		},
		
		initialize: function() {
			_.bindAll(this);
			this.$tilesContainer = this.$("#tilesContainer");
			this.$startDiv = this.$("#startDiv");
			this.$revealDiv = this.$("#revealDiv");
			this.$options = this.$("#options");
						
			this.render();
		},
		
		render: function() {			

			this.renderStartButton();
			this.renderRevealButton();
			this.$options.html(this.optionsTemplate(this.model.toJSON()));
			$( '#level' ).dropdown( {
					gutter : 5,
					stack : false,
					delay : 100,
					slidingIn : 100
				} );
			var level = this.model.get("Level");
			var size = this.model.get("GameSizes")[level];
			var containerSize = this.model.get("ContainerSizes")[level];
			var noOfTiles = size * size;
			this.$tilesContainer.css({width : containerSize});
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
			this.$reveal = this.$("#reveal");
			this.$clicks = this.$("#clicks");
			this.$timer = this.$("#timer");
			this.$pairs = this.$("#pairs");
			this.$level = this.$("#level");
			this.$theme = this.$("#theme");
			this.$panel = this.$(".panel");
		},

		renderStartButton: function() {
			this.$startDiv.html(this.startButtonTemplate(this.model.toJSON()));
		},

		renderRevealButton: function() {
			this.$revealDiv.html(this.revealButtonTemplate(this.model.toJSON()));
		},
		
		startGame: function() {
			console.log("startGame");
			this.model.set({GameStatus: Game.RUNNING});
			this.renderStartButton();
			this.renderRevealButton();
			Game.Timer.start();
		},
		
		revealTiles: function() {
			console.log("revealTiles");
			this.model.set({RevealStatus: Game.REVEALED, GameStatus: Game.STOPPED});
			this.renderStartButton();
			this.renderRevealButton();
			this.$panel.addClass("flip");
			Game.Timer.stop();
		},
		
		changeLevel: function(event) {
			console.log("changeLevel");
			this.model.set({Level: parseInt(this.$level.val())});
			this.model.set({GameStatus: Game.READY, RevealStatus: Game.REVEAL});
			this.render();
			Game.Timer.stop();
		},
		
		changeTheme: function() {
			console.log("changeTheme");
			console.log(this.$theme.val());
			this.model.set({Theme: this.$theme.val()});
			this.model.set({GameStatus: Game.READY, RevealStatus: Game.REVEAL});
			this.render();
			Game.Timer.stop();
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
				}
				else {
					this.flipBackTiles();					
				}
			}
		},

		updateClicksCount: function(addOrMinus) {
			var count = this.model.get("ClicksCount");
			this.model.set({ClicksCount: (addOrMinus==="add")?count+1:count-1});
			this.$clicks.val(this.model.get("ClicksCount"));
		},

		updatePairsDone: function() {
			var count = this.model.get("PairsDone");
			this.model.set({PairsDone: count+1});
			this.$pairs.val(this.model.get("PairsDone"));
		},

		dissolveTiles: function() {
			$(".flip").removeClass("flip").addClass("dissolve");
		},

		flipBackTiles: function() {
			$(".flip").removeClass("flip");
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

	var base = 60;
	var clocktimer,dateObj,dh,dm,ds,ms;
	var readout='';
	var h=1;
	var m=1;
	var tm=1;
	var s=0;
	var ts=0;
	var ms=0;
	var show = true;

	dateObj = new Date();

	Game.Timer = {

		start: function() {
			var cdateObj = new Date();
			
			var t = (cdateObj.getTime() - dateObj.getTime())-(s*1000);

			if (t>999) { s++; }

			if (s>=(m*base)) {
				ts=0;
				m++;
				} else {
				ts=parseInt((ms/100)+s);
				if(ts>=base) { ts=ts-((m-1)*base); }
				}

			if (m>(h*base)) {
				tm=1;
				h++;
				} else {
				tm=parseInt((ms/100)+m);
				if(tm>=base) { tm=tm-((h-1)*base); }
				}

			ms = Math.round(t/10);
			if (ms>99) {ms=0;}
			if (ms==0) {ms='00';}
			if (ms>0&&ms<=9) { ms = '0'+ms; }

			if (ts>0) { ds = ts; if (ts<10) { ds = '0'+ts; }} else { ds = '00'; }
			dm=tm-1;
			if (dm>0) { if (dm<10) { dm = '0'+dm; }} else { dm = '00'; }
			dh=h-1;
			if (dh>0) { if (dh<10) { dh = '0'+dh; }} else { dh = '00'; }

			readout = dh + ':' + dm + ':' + ds + '.' + ms;
			if (show==true) { $("#timer").val(readout); }

			clocktimer = setTimeout(Game.Timer.start,1);
		},

		stop: function() {
			clearInterval(clocktimer);
			h=1;m=1;tm=1;s=0;ts=0;ms=0;			
			readout='00:00:00.00';
			dateObj = new Date();
		}

	}
});