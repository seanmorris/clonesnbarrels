var MusicSubmenu = function(game)
{
	var dynMenu = new Menu(game);

	dynMenu.options['play/pause'] = function()
	{
		game.bgm.play()
	};
	
	dynMenu.options['next'] = function()
	{
		game.bgm.next()
	};
	
	dynMenu.options['previous'] = function()
	{
		game.bgm.previous()
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

var MuteSubmenu = function(game)
{
	
};