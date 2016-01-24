var MusicSubmenu = function(game)
{
	var dynMenu = new Menu(game);

	dynMenu.options['play/pause'] = function()
	{
		bgmPlayer().play()
	};
	
	dynMenu.options['next'] = function()
	{
		bgmPlayer().next()
	};
	
	dynMenu.options['previous'] = function()
	{
		bgmPlayer().previous()
	};

	dynMenu.options['deeper'] = function()
	{
		var dynMenu = new Menu(game);

		dynMenu.options['..'] = function(){
			game.restoreState();
		};

		dynMenu.options['next'] = function(){
			game.restoreState();

			var dynMenu = new Menu(game);

			dynMenu.options['.. lol'] = function(){
				game.restoreState();
			};

			game.stackState(
				'menu'
				, {menu: dynMenu}
				, true
			);
		};

		game.stackState(
			'menu'
			, {menu: dynMenu}
			, true
		);	
	};
	
	dynMenu.options['back'] = function(){
		game.restoreState();
	};

	game.stackState(
		'menu'
		, {menu: dynMenu}
		, true
	);
};

var MuteSubmenu = function()
{
	var muted = parseInt(localStorage.getItem('muted'));

	bgmPlayer().play(muted);

	localStorage.setItem('muted', muted ? "0" : "1");
};