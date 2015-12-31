var BeepNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/beep.wav');
function Dialog(game, text)
{
	this.cacheBg = null;

	this.flushBg = function()
	{
		this.cacheBg = null;
	}

	this.game = game;

	this.leftMargin = 0;

	this.topMargin  = 8;

	this.beepNoise = BeepNoise;

	var width   = game.canvas.width();
	var height  = game.canvas.height();

	this.render = function()
	{
		var context     = game.canvas[0].getContext('2d');

		if(this.cacheBg == null)
		{
			this.beepNoise.play();

			this.cacheBg = context.getImageData(
				0
				, 0
				, width
				, height
			);
		}

		var center	= [width/2,height/2];

		context.putImageData(
			this.cacheBg
			, 0
			, 0
		);

		context.globalAlpha = 0.6;

		context.fillStyle = '#000';

		context.fillRect(
			0
			, (height/8)*3
			, width
			, (height/8)*2
		);

		context.globalAlpha = 1;
		context.fillStyle = '#FFF';

		context.font = '18pt monospace';
		context.textAlign = 'center';

		context.fillText(
			text
			, center[0] + this.leftMargin
			, center[1] + this.topMargin
		);
	}

	this.rect = function()
	{
		var context     = game.canvas[0].getContext('2d');
		context.rect(
			0
			, (height/8)*3
			, width
			, (height/8)*2
		);
	}

	this.exit = 0;

	this.update = function(input)
	{
		if(this.exit && !input.keyStates[32] && input.keyStates[32]!==0)
		{
			this.exit = false;
			game.restoreState();
		}

		if(
			input
			&& input.keyStates
			&& input.keyStates[32] === 0
			|| (input
				&& input.clickVectors
				&& input.clickVectors[0]
				&& input.clickVectors[0].undragged
				&& input.clickVectors[0].released
				&& input.clickVectors[0].age < game.currentState.age
			)
		){
			this.exit = true;
		}
	}
}
