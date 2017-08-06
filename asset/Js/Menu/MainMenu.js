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
	/*
	this.options['load game']	= function()
	{
		game.changeState('main', {}, true);

		var saveState = new SaveState();
		var world = game.currentState.world;

		console.log(world);
		
		saveState.load(world);
	};

	this.options['load game']	= SaveSubmenu;
	*/
	this.options['music']		= MusicSubmenu;
	this.options['mute']		= function()
	{
		var muted = parseInt(localStorage.getItem('muted'));
		game.bgm.play(muted);
		localStorage.setItem('muted', muted ? "0" : "1");
		game.message.blit(!muted ? 'Sound muted.' : 'Sound on.');
	};
}
