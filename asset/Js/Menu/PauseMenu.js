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
		game.message.blit('Welcome back.');
		game.changeState('main', {}, true);
	};

	this.options['load game']	= SaveSubmenu;

	this.options['save game']	= function()
	{
		var saveState = new SaveState();
		var world = game.stateStack[0].world;

		if(saveState.save(world))
		{
			game.message.blit('Saved "' + world.saveStateTitle + '".', 300);
		}
		else
		{
			var messages = saveState.getMessages();
			for(var i in messages)
			{
				game.message.blit(messages[i], 300);
			}
		}


		game.restoreState();
	};

	this.options['music']		= MusicSubmenu;
	this.options['mute']		= function()
	{
		var muted = parseInt(localStorage.getItem('muted'));
		game.bgm.play(muted);
		localStorage.setItem('muted', muted ? "0" : "1");
		game.message.blit(!muted ? 'Sound muted.' : 'Sound on.');
	};

	/*

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

	*/
}
