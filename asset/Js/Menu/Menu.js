function Menu(game)
{
	this.cacheBg				= null;
	this.ignoreInput			= 0;
	this.ignoreInputTime		= 5;
	this.options				= [];

	this.selected = 0;
	this.selectedOption;

	this.bgColor				= '#111';
	this.bgAlpha				= 0.6;

	this.textColor				= '#A65560';
	this.boxColor				= '#280212';

	this.selectedTextColor		= '#F8435C';
	this.selectedBoxColor		= '#652931';

	this.leftMargin				= -180;
	this.leftTextMargin			= 10;

	this.topMargin				= 250;

	this.maxMag					= 250;

	this.boxSize				= 40;
	this.selectedBoxSize		= 60;

	this.margins				= 10;
	this.selectedMargins		= 35;

	this.context				= game.canvas[0].getContext('2d');

	this.game					= game;

	this.update = function()
	{
		if(this.ignoreInput < 0)
		{
			this.ignoreInput = 0;
		}

		for (var i in game.keyStates)
		{
			if(game.keyStates[i] === 0)
			{
				this.ignoreInput = 0;
			}
		}

		if(!this.ignoreInput || game.scrollStates[0] || game.scrollStates[1])
		{
			if(this.used)
			{
				this.used(game);
				this.used = null;
			}

			var tickDelay = 0;

			if(game.clickVectors
				&& game.clickVectors[0]
				&& game.clickVectors[0].magnitude
			){
				var mag = game.clickVectors[0].magnitude;

				if(mag > this.maxMag)
				{
					mag = this.maxMag;
				}

				tickDelay = (this.maxMag/20)-(mag/20);
			}

			//console.log(tickDelay);

			var center = this.getCenter();

			if(
			   game.keyStates[38]
			   || game.padAxes[1] < -0.25
			   || game.keyStates[87]
			   || game.scrollStates[1]
			   || (game.clickVectors[0]
					&& game.clickVectors[0].active()
					&& game.clickVectors[0].cardinal()
						== game.clickVectors[0].UP
				)
			){
				this.selected--;
				this.ignoreInput = this.ignoreInputTime;
			}
			else if(
				game.keyStates[40]
				|| game.keyStates[83]
			   	|| game.padAxes[1] > 0.25
				|| game.scrollStates[0]
				|| (game.clickVectors[0]
					&& game.clickVectors[0].active()
					&& game.clickVectors[0].cardinal()
						== game.clickVectors[0].DOWN
				)
			){
				this.selected++;
				this.ignoreInput = this.ignoreInputTime;
			}
			else if(
				game.keyStates[32] === 0
				|| game.keyStates[13] === 0
			   	|| game.padStates[0] === 0
				|| (game.clickVectors[0]
					&& game.clickVectors[0].undragged
					&& game.clickVectors[0].released
					&& game.clickVectors[0].startX > center[0]
						+ this.leftMargin
						+ $(this.context.canvas).offset().left
						- this.selectedBoxSize
				)
			){
				selectOffset = 0;

				if(game.clickVectors[0])
				{
					var yClick = game.clickVectors[0].startY
						 - $(this.context.canvas).offset().top
						 - this.topMargin
						 - this.boxSize
						 - this.margins;

					var interval = this.boxSize + this.margins;

					if(yClick >= 0 && yClick < (this.selectedBoxSize + this.margins))
					{
						this.select(this.selected);
					}
					else
					{
						var selectOffset = parseInt(yClick/interval);

						if(yClick < 0)
						{
							selectOffset--;
						}

						console.log(this.selected, selectOffset, this.options)

						if(this.option(this.selected+selectOffset))
						{
							this.select(this.selected+selectOffset);
						}
					}
				}
				else
				{
					this.select(this.selected);
				}

				// @todo Add or subtract x from this.selected 
				// based on mouse position from
				// game.clickVectors[0]

				// 
			}

			var opLen = 0;

			for(var i in this.options)
			{
				opLen++;
			}

			if(this.selected < 0)
			{
				this.selected = opLen -1;
			}
			else if(this.selected >= opLen)
			{
				this.selected = 0;
			}
		}
		else
		{
			this.ignoreInput--;
		}
	}

	this.flushBg = function()
	{
		this.cacheBg = null;
	}

	this.getCenter = function()
	{
		var width   = this.game.canvas.width();
		var height  = this.game.canvas.height();
		return [width/2,height/2];
	}

	this.render = function(noBg)
	{
		var width   = game.canvas.width();
		var height  = game.canvas.height();
		var center	= [width/2,height/2];
		
		if(this.cacheBg === null)
		{
			this.cacheBg = this.context.getImageData(
				0
				, 0
				, width
				, height
			);
		}

		if(!noBg)
		{
			this.context.putImageData(
				this.cacheBg
				, 0
				, 0
			);

			this.context.globalAlpha = this.bgAlpha;

			this.context.fillStyle = this.bgColor;

			this.context.fillRect(
				0
				, 0
				, width
				, height
			);
		}

		this.context.globalAlpha = 1;
		this.context.textAlign = 'left';
		this.context.font = '18pt monospace';

		var j = 0;
		for(var i in this.options)
		{
			offset = (this.boxSize * (j-this.selected+1))
				+ (this.margins * (j-this.selected+1))
			;

			var showText = i;

			/*
			if(this.options[i].name)
			{
				showText = this.options[i].name;
			}
			*/

			if(j == this.selected)
			{
				this.context.fillStyle = this.selectedBoxColor;
				this.context.fillRect(
					center[0] - this.selectedBoxSize + this.leftMargin
					, offset + this.topMargin
					, this.selectedBoxSize
					, this.selectedBoxSize
				);

				this.context.fillStyle = this.selectedTextColor;
				this.context.strokeStyle = '#000';

				this.context.strokeText(
					showText
					, center[0]+this.leftTextMargin+this.leftMargin
					,  offset + this.topMargin + this.selectedMargins
				);
				this.context.fillText(
					showText
					, center[0]+this.leftTextMargin+this.leftMargin
					,  offset + this.topMargin + this.selectedMargins
				);
			}
			else if(j > this.selected)
			{
				this.context.fillStyle = this.boxColor;
				this.context.fillRect(
					center[0] - this.boxSize+this.leftMargin
					, offset + this.topMargin + (this.margins*2)
					, this.boxSize
					, this.boxSize
				);

				this.context.fillStyle = this.textColor;
				this.context.strokeStyle = '#000';
				
				this.context.strokeText(
					showText
					, center[0]+this.leftTextMargin+this.leftMargin
					, offset + this.topMargin + (this.margins + this.selectedMargins)
				);
				this.context.fillText(
					showText
					, center[0]+this.leftTextMargin+this.leftMargin
					, offset + this.topMargin + (this.margins + this.selectedMargins)
				);
			}
			else
			{
				this.context.fillStyle = this.boxColor;
				this.context.fillRect(
					center[0] - this.boxSize+this.leftMargin
					, offset + this.topMargin - this.margins
					, this.boxSize
					, this.boxSize
				);

				this.context.fillStyle = this.textColor;

				this.context.fillText(
					showText
					, center[0]+this.leftTextMargin+this.leftMargin
					, offset + this.topMargin + (this.selectedMargins - this.margins)
				);
			}

			j++;
		}
	}

	this.used = null;

	this.option = function(option)
	{
		for(var i in this.options)
		{
			if(!option--)
			{
				return this.options[i];
			}
		}		
	}

	this.select	= function(option)
	{
		for(var i in this.options)
		{
			if(!option--)
			{
				//console.log(i);
				this.used = this.options[i];
			}
		}
	}
}
