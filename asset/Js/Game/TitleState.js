function TitleState(game)
{
	var state		= new State();
	var opened      = true;

	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.onEnter = function(params)
	{
		var muted = parseInt(localStorage.getItem('muted'));

		game.message.blit(muted ? 'Sound muted.' : 'Sound on.');
		/*
		game.message.blit('Space, click or tap to begin.');
		*/
		muted || game.bgm.play();
		this.titleScreen = new TitleScreen(game);
		// this.titleBGM = new Audio('/SeanMorris/ClonesNBarrels/Sound/530471_Coins-8Bit.mp3');
		//this.titleBGM.play();

		window.autoMenu = setTimeout(
			function()
			{
				if(opened)
				{
					return;
				}
				game.stackState(
					'menu'
					, {menu: new MainMenu(game)}
					, true
				);
			}
			, 4500
		);
	}

	this._update = this.update;
	this.update = function()
	{
		this.titleScreen.render();

		if((game.clickVectors[0]
			&& game.clickVectors[0].released)
			|| game.keyStates[32] === 0
		){
			opened = true;
			game.stackState(
				'menu'
				, {menu: new MainMenu(game)}
				, true
			);
		}
	}

	this.onExit = function()
	{
		//this.titleBGM.pause();
	}
}
