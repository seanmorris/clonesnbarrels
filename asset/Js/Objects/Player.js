var Player = DamageableCharacter.extend({
	init: function()
	{
		this.name 			= 'Player';
		this.moveThreshold	= 3;
		this.moveAccs		= [];
		this._super(new PlayerSprite(), 100);
		this.corpse = new PlayerCorpse(
			new PlayerCorpseSprite()
			, 100
			, new BloodStain()
		);
		this.frameTime = 3;
		this.invincible = false;
		this.tileOffsetY = -7;
		this.party = [];
		this.ignoreControl = false;
		this.updatePriority = 10;
		this.doNotStore = true;
		this.inventory = [];
		this.stepSpeed = 6;
		this.ghost = false;
		this.vacuumDamageTimer = 0;
		this.vacuumDamageTimerMax = 60;
	}
	, canStep: function(testCall)
	{
		if(this.ghost)
		{
			return true;
		}

		return this._super(testCall);
	}
	, acquire: function(item)
	{
		this.inventory.push(item);
	}
	, drop: function(item)
	{
		for(var i in this.inventory)
		{
			if(item === this.inventory[i])
			{
				return this.inventory.splice(i,1);
			}
		}

		return undefined;
	}
	, addParty: function(member)
	{
		this.party.push(member);
		member.master = this;
	}
	, removeParty: function(member)
	{
		for(var i in this.party)
		{
			if(this.party[i] === member)
			{
				this.party[i].master = null;
				return this.party.splice(i, 1);
			}
		}

		return undefined;
	}
	, getParty: function()
	{
		var party = [];

		for(var i in this.party)
		{
			party.push(this.party[i]);
		}

		return party;
	}
	, _damage: function(amount, other)
	{
		if(this.invincible)
		{
			return null;
		}

		return this._super(amount, other);
	}
	, toggleInvincible: function()
	{
		this.resetSprite();

		if(this.invincible = !this.invincible)
		{
			this.alterSprite(this.scaleColors(1.2, .6, .5, 1));
			this.preloadSprite();
			this.alterSprite(this.invertColors());
			this.preloadSprite();
			this.alterSprite(this.scanGlitchColors(4,0));
			this.preloadSprite();
		}
	}
	, toggleGhost: function()
	{
		this.ghost = !this.ghost;
		
		if(this.ghost)
		{
			this.alterSprite(this.ghostColors());
		}
		else
		{
			this.resetSprite();
		}

		this.preloadSprite();
	}
	, turn: function(direction)
	{
		this._super(direction);
	}
	, getMove: function(input)
	{
		var moveAccs	= [];
		var turn		= this.direction;

		moveAccs[ this.UP ]		= this.moveAccs[ this.UP ];
		moveAccs[ this.DOWN ]	= this.moveAccs[ this.DOWN ];
		moveAccs[ this.LEFT ]	= this.moveAccs[ this.LEFT ];
		moveAccs[ this.RIGHT ]	= this.moveAccs[ this.RIGHT ];

		if(
			(input.keyStates[37]
				|| input.keyStates[65]
				|| (input.clickVectors[0]
					&& input.clickVectors[0].active()
					&& input.clickVectors[0].cardinal() == this.LEFT
				)
				|| input.axes[0] < -0.75
			)
			&& ! moveAccs[ this.DOWN ]
			&& ! moveAccs[ this.RIGHT ]
			&& ! moveAccs[ this.UP ]
		){
			turn = this.LEFT;

			if(moveAccs[ this.LEFT ])
			{
				moveAccs[ this.LEFT ]++;
			}
			else
			{
				moveAccs[ this.LEFT ] = 1;
			}
		}
		else if(
			(input.keyStates[39]
				|| input.keyStates[68]
				|| (input.clickVectors[0]
					&& input.clickVectors[0].active()
					&& input.clickVectors[0].cardinal() == this.RIGHT
				)
				|| input.axes[0] > 0.75
			)
			&& ! moveAccs[ this.LEFT ]
			&& ! moveAccs[ this.UP ]
			&& ! moveAccs[ this.DOWN ]
		){
			turn = this.RIGHT;

			if(moveAccs[ this.RIGHT ])
			{
				moveAccs[ this.RIGHT ]++;
			}
			else
			{
				moveAccs[ this.RIGHT ] = 1;
			}
		}
		else if(
			(input.keyStates[40]
				|| input.keyStates[83]
				|| (input.clickVectors[0]
					&& input.clickVectors[0].active()
					&& input.clickVectors[0].cardinal() == this.DOWN
				)
				|| input.axes[1] > 0.75
			)
			&& ! moveAccs[ this.UP ]
			&& ! moveAccs[ this.LEFT ]
			&& ! moveAccs[ this.RIGHT ]
		){
			turn = this.DOWN;

			moveAccs[ this.LEFT ]	= 0;
			moveAccs[ this.UP ]		= 0;
			moveAccs[ this.RIGHT ]	= 0;

			if(moveAccs[ this.DOWN ])
			{
				moveAccs[ this.DOWN ]++;
			}
			else
			{
				moveAccs[ this.DOWN ]	= 1;
			}
		}
		else if(
			(input.keyStates[38]
				|| input.keyStates[87]
				|| (input.clickVectors[0]
					&& input.clickVectors[0].active()
					&& input.clickVectors[0].cardinal() == this.UP
				)
				|| input.axes[1] < -0.75
			)
			&& !moveAccs[ this.LEFT ]
			&& !moveAccs[ this.RIGHT ]
			&& !moveAccs[ this.DOWN ]
		){
			turn = this.UP;

			moveAccs[ this.LEFT ]	= 0;
			moveAccs[ this.DOWN ]	= 0;
			moveAccs[ this.RIGHT ]	= 0;

			if(moveAccs[ this.UP ])
			{
				moveAccs[ this.UP ]++;
			}
			else
			{
				moveAccs[ this.UP ] = 1;
			}
		}
		else
		{
				moveAccs[ this.LEFT ]	= 0;
				moveAccs[ this.RIGHT ]	= 0;
				moveAccs[ this.UP ]		= 0;
				moveAccs[ this.DOWN ]	= 0;
		}

		return {
			'moveAccs'	: moveAccs
			, 'turn'	: turn
		};
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		this._super(context, x, y, xPos, yPos, size);
	}
	, update: function(input, ignoreInput)
	{
		var moveInfo = this.getMove(input);
		this.moveAccs = moveInfo.moveAccs;

		if(!this.ignoreControl && !ignoreInput)
		{
			this.turn(moveInfo.turn);

			for(var i in this.party)
			{
				this.party[i].turn(moveInfo.turn);
			}
		}

		if(
			(
				this.moveAccs[this.UP] 			> this.moveThreshold
				|| this.moveAccs[this.DOWN] 	> this.moveThreshold
				|| this.moveAccs[this.LEFT]		> this.moveThreshold
				|| this.moveAccs[this.RIGHT]	> this.moveThreshold
			)
			&& !this.stepping
			&& !this.ignoreControl
			&& !ignoreInput
		){
			if(
				(input
				&& input.clickVectors
				&& input.clickVectors[0]
				&& input.clickVectors[0].magnitude > 40
				)
				|| !input
				|| !input.clickVectors
				|| !input.clickVectors[0]
			){
				// console.log('STEP', this.stepSpeed);
				this.step(this.stepSpeed);

				for(var i in this.party)
				{
					if(this.party[i].ignoreControl || this.party[i] instanceof Corpse)
					{
						continue;
					}

					if(this.party[i].stepTimer === 0)
					{
						this.party[i].step(this.stepSpeed, true);
					}
				}
			}
		}
		else if(input.keyStates[32] === 0
			|| (input.clickVectors[0]
				&& input.clickVectors[0].released
				&& input.clickVectors[0].undragged
			)
			|| input.buttons[0] === 0
		){
			this.use();
			this.wasHeld = null;
		}

		if(input.keyStates[71] === 0)
		{
			this.toggleInvincible();
		}

		if(input.keyStates[72] === 0)
		{
			this.toggleGhost();
		}

		this._super();

		for(var i in this.inventory)
		{
			this.inventory[i].update();
		}

		for(var i in this.party)
		{
			if(this.party[i].heldBy)
			{
				continue;
			}

			this.party[i].update(input);
		}
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		this._super(context, x, y, xPos, yPos, size);
		for(var i in this.inventory)
		{
			this.inventory[i].x = this.x;
			this.inventory[i].y = this.y;

			this.inventory[i].drawOffsetX = this.drawOffsetX;
			this.inventory[i].drawOffsetY = this.drawOffsetY;

			this.inventory[i].stepTimer = this.stepTimer;
			this.inventory[i].stepTime = this.stepTime;
			this.inventory[i].stepSpeed = this.stepSpeed;

			this.inventory[i].render(context, x, y, xPos, yPos, size);
		}
	}
	, use: function()
	{
		if(this.holding)
		{
			this.wasHeld = this.holding;
			this.wasHeld.droppedAgo = 0;	
			this.stopHolding();
		}

		if(this.wasHeld)
		{
			this.wasHeld.droppedAgo++;
		}

		standingOn = this.world.getObjects(this.x, this.y);

		//facing = [];
		//console.log(this.direction);

		if(this.direction == this.LEFT)
		{
			facing = this.world.getObjects(this.x-1, this.y);
		}
		else if(this.direction == this.RIGHT)
		{
			facing = this.world.getObjects(this.x+1, this.y);
		}
		else if(this.direction == this.UP)
		{
			facing = this.world.getObjects(this.x, this.y-1);
		}
		else if(this.direction == this.DOWN)
		{
			facing = this.world.getObjects(this.x, this.y+1);
		}

		for(var i in standingOn)
		{
			if(standingOn[i].useOn)
			{
				standingOn[i].useOn(this);
			}
		}

		if(this.wasHeld && this.wasHeld.droppedAgo == 0)
		{
			return;
		}

		for(var i = facing.length; i--; i >= 0)
		{
			if(facing[i].useFacing)
			{
				facing[i].useFacing(this);

				if(this.holding)
				{
					break;
				}
			}
		}
	}

	, destroy: function(clean)
	{
		if(this == this.world.viewport.actor)
		{
			if(this.lastDamagedBy)
			{
				this.world.viewport.bindCamera(this.lastDamagedBy);
			}

		}
		this._super(clean);
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy && this.lastDamagedBy.name)
		{
			this.world.game.message.blit(
				'You were killed by a ' + this.lastDamagedBy.name
				, 350
				, '25,25,25'
			);
		}

		this.world.game.message.blit(
			'Respawning in 3...',
			150,
			this.deathNoteColor
		);

		var _this = this;

		setTimeout(
			function()
			{
				_this.world.game.message.blit(
					'2...',
					150,
					this.deathNoteColor
				);
			}
			, 1000
		);
		
		setTimeout(
			function()
			{
				_this.world.game.message.blit(
					'1...',
					150,
					this.deathNoteColor
				);
			}
			, 2000
		);

		setTimeout(
			function()
			{
				Player.deaths++
				if(Player.deaths > 2)
				{
					_this.world.game.message.blit('Try not to die again.', 850, '120,120,120');
					if(Player.deaths > 4)
					{
						_this.world.game.message.blit('Like, actually try.', 850, '120,120,120');
					}
				}

				mainActor = new Player();

				_this.world.game.currentState.world.addObject(
					mainActor
					, _this.world.game.currentState.world.map.start[0]
						, _this.world.game.currentState.world.map.start[1]
				);

				_this.world.game.currentState.viewport.bindCamera(mainActor);
				_this.world.game.currentState.world.map.refreshObjects();

				mainActor.direction = 1;
			}
			, 2800
		);
	}
	, vacuumDamage: function()
	{
		for(var i in this.inventory)
		{
			if(this.inventory[i].preventVacuumDamage)
			{
				return;
			}
		}

		if(this.vacuumDamageTimer <= 0)
		{
			this.world.game.message.blit('You can\'t breath out here.', 250, 'damage');

			this.damage(10);
			this.vacuumDamageTimer = this.vacuumDamageTimerMax;
			return;
		}

		this.world

		this.vacuumDamageTimer--;
	}
});
Player.deaths = 0;