function ContinueMenu(game)
{
	var menu = new MainMenu(game);

	for(var i in menu)
	{
		this[i]		= menu[i];
	}
	this.options				= [];
	this.options['continue']	= function()
	{
		game.restoreState();
	};
}
