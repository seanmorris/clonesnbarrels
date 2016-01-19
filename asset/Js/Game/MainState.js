function MainState(game)
{
	this.player;
	this.world;

	this.inst = ++MainState.instanceCount;

	//*
	//1767 tiles
	var vXSize	= 57;
	var vYSize	= 31;
	/*/
	//1025 tiles
	var vXSize	= 41;
	var vYSize	= 25;
	//*/
	/*/
	/*/
	var vXSize	= 25;
	var vYSize	= 19;
	//*/

	if(typeof window.orientation !== 'undefined')
	{
		vXSize	= 15;
		vYSize	= 9;
	}

	var tileSize = 32;
	var _this = this;

	this.viewport	= new Viewport(game, vXSize, vYSize, tileSize);
	this.viewport.resize();
	$(window).on('resize', this.viewport.resize);

	this.onEnter = function()
	{
		//console.log('enter');
		this.viewport	= new Viewport(game, vXSize, vYSize, tileSize);
		this.viewport.resize();
		$(window).on('resize', this.viewport.resize);

		this.world		= new World();

		this.viewport.bindWorld(this.world);
		this.world.bindGameObject(game);

		this.bgm = new Audio('/SeanMorris/ClonesNBarrels/Sound/514068_N3Z-3---8-bit-crush.mp3');
		//this.bgm.play();

		this.player		= new Player(new PlayerSprite());

		if(this.world.map && this.world.map.start)
		{
			startX = this.world.map.start[0];
			startY = this.world.map.start[1];
		}

		this.world.addObject(this.player, startX, startY);

		this.viewport.bindCamera(this.player);

		console.log(this.player, startX, startY)

		this.player.turn(1);

		this.world.mapSet.switchMap(this.world.mapSet.startingMap);

		this.viewport.warp(
			Math.ceil(-vXSize / 2)
			, Math.ceil(-vYSize / 2)
		);

		var splitPathname = window.location.pathname.split('/');
		splitPathname.shift();

		console.log(splitPathname);

		if(splitPathname[1] == 'map')
		{
			console.log(splitPathname[2] + ' -- LOAD THAT MAP');
			var loadMap = new MapStorable;

			loadMap.publicId = splitPathname[2];
			loadMap.load();

			this.mapStorable = loadMap;

			console.log(loadMap);

			this.world.map.setData(loadMap.mapdata);
		}
	}

	this.update = function()
	{
		// console.log('update', game.keyStates);
		if(this.viewport)
		{
			this.viewport.update({
				'keyStates'		: game.keyStates
				, 'mouseStates'	: game.mouseStates
				, 'scrollStates': game.scrollStates
				, 'clickVectors': game.clickVectors
			});

			this.viewport.render();
		}
	}

	this.onExit = function()
	{
		//this.bgm.pause();
		$(window).off('resize', this.viewport.resize);

		if(this.world)
		{
			for(var x in this.world.objects)
			{
				for(var y in this.world.objects[x])
				{
					for(var i in this.world.objects[x][y])
					{
						this.world.objects[x][y][i] = undefined;
					}
				}
			}

			this.world.viewport = undefined;
			this.world.map = undefined;
		}

		this.viewport.resize = undefined;
		this.viewport.world = undefined;
		this.viewport.actor = undefined;
		this.viewport = undefined;
		this.world = undefined;
	}
}


MainState.instanceCount = 0;
