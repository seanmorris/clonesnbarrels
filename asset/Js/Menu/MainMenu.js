function MainMenu(game)
{
	var menu = new Menu(game);

	for(var i in menu)
	{
		this[i]		= menu[i];
	}
	
	this.options				= [];

	this.options['new game']	= function()
	{
		game.flushStates();
		game.message.blit('Welcome.');
		game.changeState('main', {}, true);
	};

	// var whoAmI = JSON.parse($.ajax({
	// 	url: 'user/current'
	// 	, dataType: 'json'
	// 	, async: false
	// 	, data:{api: 'json'}
	// }).responseText);

	var _this = this;

	console.log(_this);

	var nextPopped = focusPopped = false;

	if(0 /*whoAmI.body.id*/)
	{1
		this.options['load game']   = SaveSubmenu;

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
					game.changeState(
						'menu'
						, {menu: MainMenu(game)}
						, true
					);
					focusPopped = false;
				});
			}
			nextPopped = focusPopped = true;
		}
	}
	else
	{
		// this.options['login via facebook'] = function()
		// {
		// };

		// this.options['login via facebook'].preselect = function()
		// {
		// 	if(!nextPopped)
		// 	{
		// 		game.onNextUp(function()
		// 		{
		// 			window.open('/user/facebookConnect?page=close', '_blank');
		// 			nextPopped = false;
		// 		});
		// 	}
		// 	if(!focusPopped)
		// 	{
		// 		game.onNextFocus(function()
		// 		{
		// 			game.changeState(
		// 				'menu'
		// 				, {menu: MainMenu(game)}
		// 				, true
		// 			);
		// 			focusPopped = false;
		// 		});
		// 	}
		// 	nextPopped = focusPopped = true;
		// };
	}

	this.options['music']		= MusicSubmenu;
	this.options['mute']		= function()
	{
		var muted = parseInt(localStorage.getItem('muted'));
		game.bgm.play(muted);
		localStorage.setItem('muted', muted ? "0" : "1");
		game.message.blit(!muted ? 'Sound muted.' : 'Sound on.');
	};
}
