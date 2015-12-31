var NumberWorld = World.extend({
	init: function()
	{
		this._super();
		this.worldWidth = 16;
		this.worldHeight = 28;
	}

	, bindGameObject: function(game)
	{
		this._super(game);
		this.map.setWidth(15);
		this.map.setHeight(28);
	}

	, isWall: function(x, y)
	{
		return (x >= this.worldWidth
			|| x <= 0
			|| y <= 0
			|| y >= this.worldHeight
		);;

		if(this.addedTiles[x] && this.addedTiles[x][y])
		{
			return this.addedTiles[x][y].wall;
		}

		if(this.isWallTop(x, y))
		{
			return true;
		}

		return !(x % this.roomSize && (y) % this.roomSize)
			&& (x % (this.roomSize*2) && (y) % (this.roomSize*2))
			/*&& (x % (this.roomSize*2) && (y+1) % (this.roomSize*2))
			&& (x % (this.roomSize*2) && (y-1) % (this.roomSize*2))*/
			|| Math.abs(x) == this.worldWidth
			|| Math.abs(y) == this.worldHeight
		;
	}

	, isWallTop: function(x, y)
	{
		return false;

		return !((y+1) % this.roomSize)
			&& (x % (this.roomSize*2) && (y+1) % (this.roomSize*2))
			|| x > this.worldWidth
			|| y < -this.worldHeight
		;
	}

	, renderTile: function(context, x, y, xPos, yPos)
	{
		var text                = '(' + x + ', ' + y + ')';
		var viewport			= this.viewport;
		if(!this.dirtImg)
		{
			this.dirtImg    = new Image();
			this.dirtImg.onload = function()
			{
				viewport.forceBgUpdate();
			};

			this.dirtImg.src= '/SeanMorris/ClonesNBarrels/Img/free/floorTile.png';
		}

		if(x >= this.worldWidth
			|| x <= 0
			|| y >= this.worldHeight
			|| y <= 0
		){
			context.drawImage(
				imageCache.loadImage(
					'/SeanMorris/ClonesNBarrels/Img/pokemon/pit.png'
				)
				, xPos
				, yPos
				, this.tileSize
				, this.tileSize
			);
		}
		else if(this.isWall(x, y))
		{
			if(!this.boxTop)
			{
				this.boxTop    = new Image();

				this.boxTop.onload = function()
				{
					viewport.forceBgUpdate();
				};

				this.boxTop.src= '/SeanMorris/ClonesNBarrels/Img/free/box_face.png';
			}

			context.drawImage(
				this.boxTop
				, xPos
				, yPos
				, this.tileSize
				, this.tileSize
			);
		}
		else if(this.isWallTop(x, y))
		{
			/*
			if(!this.rockImg)
			{
				this.rockImg    = new Image();

				this.rockImg.onload = function()
				{
					viewport.forceBgUpdate();
				};

				this.rockImg.src= '/SeanMorris/ClonesNBarrels/Img/free/box_top.png';
			}

			context.drawImage(
				this.dirtImg
				, xPos
				, yPos
				, this.tileSize
				, this.tileSize
			);

			context.drawImage(
				this.rockImg
				, xPos
				, yPos
				, this.tileSize
				, this.tileSize
			);
			*/
		}
		else
		{
			context.drawImage(
				this.dirtImg
				, xPos
				, yPos
				, this.tileSize
				, this.tileSize
			);
		}

		if(this.addedTiles[x] && this.addedTiles[x][y])
		{
			context.drawImage(
				imageCache.loadImage(
					this.addedTiles[x][y].frames[0]
					, function()
					{
						viewport.forceTileUpdate(x, y);
					}
				)
				, xPos
				, yPos
				, this.tileSize
				, this.tileSize
			);
		}
	}

	, flushObjects: function(){}
	, populateObjects: function(){}
});
