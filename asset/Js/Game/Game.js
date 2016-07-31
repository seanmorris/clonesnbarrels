function Game(canvas)
{
	this.canvas		= canvas;
	this.context	= canvas[0].getContext('2d');
	this.debug		= {};

	this.deadZone	= 0.25;

	this.keyStates	= [];
	this.padStates	= [];
	this.padAxes	= [];
	this.mouseStates= [];
	this.scrollStates=[];
	this.clickVectors=[];

	this.clickVector = null;

	this.lastMouseStates = [];
	this.lastKeyStates	 = [];
	this.lastPadStates	 = [];

	this.states		= {
		init:		TitleState
		, main:		MainState
		, menu:		MenuState
		, dialog:	DialogState
		, dialogMenu: DialogMenuState
	};

	this.prevState	= null;

	this.stateStack = [];

	this.dev = false;

	this.editor = new Editor(this);
	this.message = new Message(this);
	this.bgm = new Bgm(this);

	this.restoreState = function()
	{
		if(this.stateStack.length)
		{
			this.currentState = this.stateStack.pop();
			return true;
		}

		return false;
	}

	this.stackState = function(state, params)
	{
		this.stateStack.push(this.currentState);

		this.changeState(state, params);

		return true;
	}

	this.flushStates = function()
	{
		if(this.stateStack.length)
		{
			this.currentState = this.stateStack.pop();
			return true;
		}
		this.stateStack = [];
	}

	this.changeState = function(state, params, forceNew)
	{
		if(forceNew)
		{
			while(this.stateStack.length)
			{
				this.stateStack.pop().onExit();
			}

			this.currentState.onExit();

			this.currentState = undefined;
		}

		this.currentState = new this.states[state](this);
		this.currentState.onEnter(params);
	}

	//*/
	this.currentState = new MainState(this);
	/*/
		this.currentState = this.states.main;
	//*/

	this.stackState('init');

	//Move this?
	// requestAnim shim layer by Paul Irish
	window.requestAnimFrame = (function(){
		return window.requestAnimationFrame  ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame  ||
		window.msRequestAnimationFrame  ||
		function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 30);
		};
	})();
	var fps = 0;
	var now;
	var lastUpdate = (new Date)*1 - 1;
	var fpsFilter = 10;

	var gameLoopFunc = (function(game)
	{
		return function()
		{
			setTimeout(
				function()
				{
					var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
					fps += (thisFrameFPS - fps) / fpsFilter;
					lastUpdate = now;
					//console.log('Setup next frame...');
					//*/
					requestAnimFrame(gameLoopFunc);
					/*/
					setTimeout(gameLoopFunc, 15);
					//*/

					//console.log('Start taking input');

					for(var i in game.keyStates)
					{
						if(
						   game.keyStates[i] === 0
						   && game.keyStates[i] === game.lastKeyStates[i]
						){
							delete game.keyStates[i];
							delete game.lastKeyStates[i];
						}
						else if(i in game.keyStates)
						{
							game.lastKeyStates[i] = game.keyStates[i];
						}

						if(i in game.keyStates && game.keyStates[i])
						{
							game.keyStates[i]++;
						}
					}

					for(var i in game.mouseStates)
					{
						if(
							game.mouseStates[i]
							&& game.lastMouseStates[i]
							&& game.mouseStates[i].length == 3
							&& game.lastMouseStates[i].length == 3
							&& game.mouseStates[i][2] === 0
							&& game.mouseStates[i][2] === game.lastMouseStates[i][2]
						){
							delete game.mouseStates[i];
							delete game.lastMouseStates[i];
						}
						else if(
							game.mouseStates[i]
							&& game.mouseStates[i].length == 3
						){
							game.lastMouseStates[i] = game.mouseStates[i];
						}

						if(
							game.mouseStates[i]
							&& game.mouseStates[i].length == 3
							&& game.mouseStates[i][2]
						){
							game.mouseStates[i][2]++;
						}

						if(game.clickVectors[i] && game.clickVectors[i].released)
						{
							delete game.clickVectors[i];
						}

						if(game.mouseStates[i] && game.mouseStates[i][2])
						{
							if(game.clickVectors[i])
							{
								game.clickVectors[i].update(game.mouseStates[i]);
							}
							else
							{
								var deadZone = undefined;

								if(game.dev)
								{
									deadZone = 3;
								}

								game.clickVectors[i] = new ClickVector(game.mouseStates[i], deadZone);
							}
						}
						else if(game.clickVectors[i])
						{
							game.clickVectors[i].release();
						}
					}

					if(
						game.keyStates[81] === 0
						||  game.padStates[7] === 0
						|| ( game.mouseStates[2]
							&&  game.mouseStates[2][2] === 0
						)
					){
						if(game.currentState instanceof game.states.menu)
						{
							game.restoreState();
						}
						else if(game.currentState instanceof game.states.main)
						{
							game.stackState(
								'menu'
								, {menu: new PauseMenu(game)}
								, true
							);
						}
						else
						{
							game.stackState(
								'menu'
								, {menu: new MainMenu(game)}
								, true
							);
						}
					}

					if(game.keyStates[192] === 0)
					{
						game.dev = !game.dev;
					}

					if('getGamepads' in navigator)
					{
						var gamepad = navigator.getGamepads()[0];

						if(gamepad && 'buttons' in gamepad && 'axes' in gamepad)
						{
							for(var i in gamepad.buttons)
							{
								if(gamepad.buttons[i].pressed)
								{
									if(game.padStates[i] !== undefined)
									{
										game.padStates[i]++;
									}
									else
									{
										game.padStates[i] = 1;
									}
								}
								else
								{
									if(game.padStates[i] !== undefined && game.padStates[i])
									{
										game.padStates[i] = 0;
									}
									else if(game.padStates[i] === 0)
									{
										delete game.padStates[i]
									}
								}
							}

							game.padAxes = gamepad.axes;
						}
					}

					/*if(game.keyStates[109] === 0)
					{
						game.dev = !game.dev;

						if(game.dev && game.editor.tempMapExists())
						{
							game.editor.loadTempMap();
						}
					}*/

					if(game.keyStates[221] === 0)
					{
						var state = JSON.parse(localStorage.getItem('saveState'));

						console.log(state);

						if(game.currentState.world)
						{
							game.currentState.world.mapSet.mapStates = state.maps;
							game.currentState.world.mapSet.switchMap(
								state.player.map
								, state.player.x
								, state.player.y
								, true
							);
						}
					}

					if(game.keyStates[219] === 0)
					{
						if(game.currentState.world)
						{
							game.currentState.world.mapSet.storeState();

							var state = {
								maps: game.currentState.world.mapSet.mapStates
								, player: game.currentState.world.mapSet.playerState
							};

							console.log(state);

							//localStorage.setItem('saveState', JSON.stringify(state));
						}
					}

					//console.log('Before game state update');
					game.currentState.update();
					//console.log('After game state update');
					//console.log('Before editor update');
					game.editor.update();
					//console.log('After editor update');

					game.scrollStates = [];

					for(var i in game.clickVectors)
					{
						game.clickVectors[i].render(game.context);
					}

					if(game.keyStates[109] == 2)
					{
						game.debug.showFPS = !game.debug.showFPS;
					}

					if(game.debug.showFPS)
					{
						game.context.fillStyle = '#FFF';
						game.context.strokeStyle = '#000';
						game.context.font = '14pt bold arial';
						game.context.lineWidth = 1;
						game.context.strokeText(
							fps
							, 10
							, game.canvas.height() - 40
						);
						game.context.fillText(
							fps
							, 10
							, game.canvas.height() - 40
						);
					}

					game.message.update();


					//console.log('!-----|Main Game Func End|-----!');
				}
				, 8
			);
		}
	})(this);

	gameLoopFunc();

	var _this = this;

	$(document).keydown(
		function(e)
		{
			if(_this.keyStates[ e.keyCode || e.which ])
			{
				//NOOP
			}
			else
			{
				_this.keyStates[ e.keyCode || e.which ] = 1;
			}

			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}
		}
	);

	$(document).keyup(
		function(e)
		{
			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}

			_this.keyStates[ e.keyCode || e.which] = 0;
		}
	);

	$(document).bind(
		"contextmenu"
		, function(e)
		{
			e.preventDefault();
		}
	);

	$(document).bind(
		"touchstart"
		, function(e)
		{
			var touches = e.originalEvent.changedTouches;
			var i = 0;
			while(i < touches.length)
			{
				var ii = i;

				if(i == 1)
				{
					ii = 2;
				}

				if(
					_this.mouseStates[ ii ]
					&& _this.mouseStates[ ii ].length == 3
					&& _this.mouseStates[ ii ][2]
				){
					//NOOP
				}
				else
				{
					_this.mouseStates[ ii ] = [
						touches[ ii ].pageX
						, touches[ ii ].pageY
						, 1
					];
				}

				i++;
			}
		}
	);

	$(document).mousedown(
		function(e)
		{
			if(
				_this.mouseStates[ e.button ]
				&& _this.mouseStates[ e.button ].length == 3
				&& _this.mouseStates[ e.button ][2]
			){
				//NOOP
			}
			else
			{
				_this.mouseStates[ e.button ] = [e.pageX, e.pageY, 1];
			}
		}
	);

	$(document).bind(
		"touchend"
		, function(e)
		{
			var touches = e.originalEvent.changedTouches;
			var i = 0;
			while(i < touches.length)
			{
				var ii = i;

				if(i == 1)
				{
					ii = 2;
				}

				_this.mouseStates[ ii ] = [
					touches[ ii ].pageX
					, touches[ ii ].pageY
					, 0
				];

				i++;
			}
		}
	);

	$(document).mouseup(
		function(e)
		{
			_this.mouseStates[ e.button ] = [e.pageX, e.pageY, 0];

			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}
		}
	);

	window.mouseX = 0;
	window.mouseY = 0;

	$(document).bind(
		"touchmove"
		, function(e)
		{
			var touches = e.originalEvent.changedTouches;
			var i = 0;
			while(i < touches.length)
			{
				var ii = i;

				if(i == 1)
				{
					ii = 2;
				}

				window.mouseX = touches[ ii ].pageX;
				window.mouseY = touches[ ii ].pageY;

				i++;
			}

			return false;
		}
	);

	$(document).mousemove(
		function(e)
		{
			window.mouseX = e.pageX;
			window.mouseY = e.pageY;
		}
	);

	$(document).bind(
		'mousewheel DOMMouseScroll'
		, function(e)
		{
			if(e.originalEvent.wheelDelta /120 > 0)
			{
				console.log(
					"scrollUp at ("
					+ window.mouseX + ", "
					+ window.mouseY + ")"
				);
				_this.scrollStates[1] = true;
			}
			else
			{
				console.log(
					"scrollDown at ("
					+ window.mouseX + ", "
					+ window.mouseY + ")"
				);
				_this.scrollStates[0] = true;
			}

			console.log(
				document.activeElement
				, _this.canvas[0]
				, document.activeElement === _this.canvas[0]
			);

			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}
		}
	);
}
