function TitleState(game)
{
	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.onEnter = function(params)
	{
		var muted = localStorage.getItem('muted');

		muted || bgmPlayer().play();
		this.titleScreen = new TitleScreen(game);
		// this.titleBGM = new Audio('/SeanMorris/ClonesNBarrels/Sound/530471_Coins-8Bit.mp3');
		//this.titleBGM.play();
	}

	this._update = this.update;
	this.update = function()
	{
		this.titleScreen.render();

		if((game.clickVectors[0]
			&& game.clickVectors[0].released)
			|| game.keyStates[32] === 0
		){
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
