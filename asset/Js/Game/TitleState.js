function TitleState(game)
{
	var state		= new State();
	
	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.onEnter = function(params)
	{
		var muted = parseInt(localStorage.getItem('muted'));

		muted || game.bgm.play();
		this.titleScreen = new TitleScreen(game);
	}

	var used = false;

	this.update = function()
	{
		this.titleScreen.render();

		if((game.clickVectors[0]
			&& game.clickVectors[0].released)
			|| game.keyStates[32] === 0
		){
			used = true;
			game.stackState(
				'menu'
				, {menu: new MainMenu(game)}
				, true
			);
		}
	}

	var autoForward = setTimeout(
		function()
		{
			if(used)
			{
				return;
			}
			game.stackState(
				'menu'
				, {menu: new MainMenu(game)}
				, true
			);			
		}
		, 6500
	);

	this.onExit = function()
	{
		clearTimeout(autoForward);
		//this.titleBGM.pause();
	}
}
