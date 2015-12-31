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
		game.changeState('main', {}, true);
	};

	this.options['load game']	= function()
	{
		//console.log('unimplemented');
	};

	this.options['help']		= function()
	{
		//console.log('unimplemented');
	};

	this.options['credits']		= function()
	{
		console.log(

		);
	};
	
	this.options['exit']		= function()
	{
		window.location.href = '/';
	};

}
