function TitleState(game)
{
	var state = new State();
	var used = false;

	for(var i in state)
	{
		this[i]		= state[i];
	}

	var autoForward;
	var setAutoForward = function()
	{
		clearTimeout(autoForward);
		autoForward = setTimeout(
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
			, 3750
		);
	}

	this.onEnter = function(params)
	{
		var muted = parseInt(localStorage.getItem('muted'));

		var used = false;

		muted || game.bgm.play();
		this.titleScreen = new TitleScreen(game);

		//setAutoForward();
	}

	this.onRestore = function()
	{
		//setAutoForward();
	}

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

	this.onExit = function()
	{
		clearTimeout(autoForward);
		//this.titleBGM.pause();
	}
}
