function PauseMenu(game)
{
	var menu = new MainMenu(game);

	for(var i in menu)
	{
		this[i]		= menu[i];
	}
	this.options				= [];
	this.options['resume']		= function()
	{
		game.restoreState();
	};

	this.options['new game']	= function()
	{
		game.flushStates();
		game.changeState('main', {}, true);
	};

	this.options['load game']	= function()
	{
		var saveState = new SaveState();
		var world = game.stateStack[0].world;

		console.log(world);
		
		saveState.load(world);

		game.restoreState();
	};

	this.options['save game']	= function()
	{
		var saveState = new SaveState();
		var world = game.stateStack[0].world;

		saveState.save(world);

		JSON.stringify(game.stateStack[0].world.getState());
		
		game.restoreState();
	}

	this.options['help']		= function()
	{
		//console.log('unimplemented');
	};

	this.options['credits']		= function()
	{
		//console.log('unimplemented');
	};

	this.options['dynamic'] = function()
	{
		var dynMenu = new Menu(game);

		dynMenu.options['a'] = function()
		{
			var dynMenu = new Menu(game);

			dynMenu.options['1'] = function(){};
			dynMenu.options['2'] = function(){};
			dynMenu.options['3'] = function(){};

			dynMenu.options['back'] = function(){
				game.restoreState();
			};

			game.stackState(
				'menu'
				, {menu: dynMenu}
				, true
			);
		};
		dynMenu.options['b'] = function(){};
		dynMenu.options['c'] = function(){};

		dynMenu.options['back'] = function(){
			game.restoreState();
		};

		game.stackState(
			'menu'
			, {menu: dynMenu}
			, true
		);
	};

	this.options['exit']		= function()
	{
		window.location.refresh();
	};
}
