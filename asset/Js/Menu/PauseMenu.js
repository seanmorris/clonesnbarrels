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

	var whoAmI = JSON.parse($.ajax({
		url: 'user/current'
		, dataType: 'json'
		, async: false
		, data:{api: 'json'}
	}).responseText);

	var nextPopped = focusPopped = false;
	
	if(whoAmI.body.id)
	{
		this.options['load game']   = SaveSubmenu;

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
		
		this.options['log out']     = function()
		{
			
		};

		var _this = this;

		this.options['log out'].preselect = function()
		{
			game.onNextUp(function()
			{
				window.open('/user/logout?page=close', '_blank');
				game.restoreState();
			});
		}

		this.options['log out']     = function()
		{
			
		};

		this.options['log out'].preselect = function()
		{
			if(!nextPopped)
			{
				game.onNextUp(function()
				{
					window.open('/user/logout?page=close', '_blank');
					nextPopped = false;
				});
			}
			if(!focusPopped)
			{
				game.onNextFocus(function()
				{
					game.flushStates();
					game.stackState(
						'menu'
						, {menu: new PauseMenu(game)}
					);
					focusPopped = false;
				});
			}
			nextPopped = focusPopped = true;
		}
	}
	else
	{
		this.options['login via facebook'] = function()
		{
		};

		this.options['login via facebook'].preselect = function()
		{
			if(!nextPopped)
			{
				game.onNextUp(function()
				{
					window.open('/user/facebookConnect?page=close', '_blank');
					nextPopped = false;
				});
			}
			if(!focusPopped)
			{
				game.onNextFocus(function()
				{
					game.flushStates();
					game.stackState(
						'menu'
						, {menu: new PauseMenu(game)}
						, false
					);
					focusPopped = false;
				});
			}
			nextPopped = focusPopped = true;
		};
	}

	this.options['music']		= MusicSubmenu;
	this.options['mute']		= function()
	{
		var muted = parseInt(localStorage.getItem('muted'));
		game.bgm.play(muted);
		localStorage.setItem('muted', muted ? "0" : "1");
		game.message.blit(!muted ? 'Sound muted.' : 'Sound on.');
	};


	this.options['back'] = function(){
		game.restoreState();
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
