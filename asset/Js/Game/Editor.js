var Editor = Class.extend({
	init: function(game)
	{
		this.game = game;
		this.controlPanel = $('table#editor');
		this.selectedTileImg = $('img#tileEditorSelectionImg');
		this.selectedTileText = $('span#editorSelection');
		this.tilePalletBox = $('div#tileEditorPalletBox');

		//this.selectedObjImg = $();

		this.objectPalletBox = $('td#objectEditorPallet');
		this.objectList = $('ul#objectList');
		this.objectListTrigger = $('ul#objectListTrigger');

		this.mapResizeButton = $('button#setMapSize');

		this.mapWidthInput = $('input#mapWidth');
		this.mapHeightInput = $('input#mapHeight');

		this.setStartButton = $('button#setStart');

		this.playerStartXInput = $('input#playerStartX');
		this.playerStartYInput = $('input#playerStartY');

		this.objectPropertyEditor = $('div#objectPropertyEditor');

		this.triggerEditorMenu = $('ul#triggerEditorMenu');

		this.wallCheckbox = $('input#wallBool');

		this.setMapTitleButton = $('button#setMapTitle');

		this.nextSelectCallBack = null;

		this.effectPalletBox = $('select#tileEffectPallet');

		this.setTileEffect = $('#setTileEffect');
		this.clearTileEffect = $('#clearTileEffect');

		var _this = this;

		this.setTileEffect.click(function(){
			_this.applyToSelectedTiles(function(x,y){
				_this.game.currentState.world.map.setTileEffect(
					_this.effectPalletBox.val()
					, x
					, y
				);
			});
		});

		// this.game.currentState.world.map.setData();
		console.log();

		this.mapResizeButton.click(
			function()
			{
				var newTile = 0;

				if(_this.tilePalletSelection !== null)
				{
					newTile = _this.tilePalletSelection;
				}

				_this.game.currentState.world.map.setWidth(
					parseInt($('input#mapWidth').val())
					, newTile
				);
				_this.game.currentState.world.map.setHeight(
					parseInt($('input#mapHeight').val())
					, newTile
				);

				_this.storeTempMap();
			}
		);

		this.setStartButton.click(
			function()
			{
				var x = parseInt($('input#playerStartX').val());
				var y = parseInt($('input#playerStartY').val());

				if(!_this.game.currentState.world.map.isTileOnMap(x,y))
				{
					return;
				}

				_this.game.currentState.world.map.start = [x,y];

				_this.storeTempMap();
			}
		);

		this.setMapTitleButton.click(
			function()
			{
				_this.game.currentState.world.map.title = $('input#mapTitle').val();

				_this.storeTempMap();
			}
		);

		$('button#saveMap').click(
			function()
			{
				var map = new MapStorable();

				if(_this.game.currentState.mapStorable)
				{
					map = _this.game.currentState.mapStorable;
					map.publicId = _this.game.currentState.mapStorable.publicId;
				}
				else
				{
					map.publicId = _this.game.currentState.world.mapSet.currentMap;
				}

				map.title = _this.game.currentState.world.map.title;
				map.mapdata = _this.game.currentState.world.map.getData();
				
				map.save(_this.game.currentState.world);
			}
		);

		$('button#downloadMap').click(
			function()
			{
				saveAs(
					new Blob(
						[_this.game.currentState.world.map.getData()]
						, {type: "application/json;charset=" + document.characterSet}
					)
					, _this.game.currentState.world.map.title + "_map.json"
				);
			}
		);

		$('input#loadMap').change(function(e)
		{
            var files = event.target.files; //FileList object
            var output = document.getElementById("result");

            for(var i = 0; i< files.length; i++)
            {
                var file = files[i];

                var mapReader = new FileReader();

                mapReader.addEventListener(
					"load"
					, function(e)
					{
						_this.game.currentState.world.map.setData(e.target.result);
					}
				);

                mapReader.readAsText(file);
            }

        });

		$('button#tileMode').click(
			function()
			{
				$('tr.editorRow').hide(0);
				$('tr.tileEditorRow').show(0);
			}
		);

		$('button#objectMode').click(
			function()
			{
				$('tr.editorRow').hide(0);
				$('tr.objectEditorRow').show(0);
			}
		);

		$('button#triggerMode').click(
			function()
			{
				$('tr.editorRow').hide(0);
				$('tr.triggerEditorRow').show(0);
			}
		);

		$('button#mapMode').click(
			function()
			{
				$('tr.editorRow').hide(0);
				$('tr.mapEditorRow').show(0);
			}
		);

		$('button#tileEffectMode').click(
			function()
			{
				$('tr.editorRow').hide(0);
				$('tr.tileEffectEditorRow').show(0);
			}
		);

		this.selectedTile = [0,0];

		this.tilePalletSelection = null;

		this.init = true;
		this.display = false;
	}
	, onNextSelect: function(callBack)
	{
		this.nextSelectCallBack = callBack;
	}
	, applyToSelectedTiles: function(callback)
	{
		var selected = [];
		if(this.selectedTile && this.startSelectedTile)
		{
			var iInc = 1;
			var jInc = 1;

			if(this.selectedTile[0] < this.startSelectedTile[0])
			{
				iInc = -1;
			}

			if(this.selectedTile[1] < this.startSelectedTile[1])
			{
				jInc = -1;
			}

			for(var i = this.startSelectedTile[0]; i != this.selectedTile[0] + iInc; i += iInc){
			for(var j = this.startSelectedTile[1]; j != this.selectedTile[1] + jInc; j += jInc){
				callback(i, j);
			}}
		}
		else if(this.selectedTile)
		{
			callback(this.selectedTile[0], this.selectedTile[1]);
		}
	}
	, populatePallet: function()
	{
		var tilePallet = this.game.currentState.world.map.tilePallet;
		var objectPallet = this.game.currentState.world.map.objectPallet;
		var effectPallet = this.game.currentState.world.map.tileEffectPallet;

		var _this = this;

		for(var i in tilePallet)
		{
			// console.log(tilePallet[i]);

			// console.log(imageCache.loadImage(tilePallet[i]));

			this.tilePalletBox.append(
				$('<img />')
					.attr('id', 'pallet_' + i)
					.attr('class', 'palletImg')
					.attr('src', imageCache.loadImage(tilePallet[i]).src)
					.attr('data-i', i)
					.click(
						function(e)
						{
							if(_this.selectedTile && _this.startSelectedTile)
							{
								var iInc = 1;
								var jInc = 1;

								if(_this.selectedTile[0] < _this.startSelectedTile[0])
								{
									iInc = -1;
								}

								if(_this.selectedTile[1] < _this.startSelectedTile[1])
								{
									jInc = -1;
								}

								for(var i = _this.startSelectedTile[0]; i != _this.selectedTile[0] + iInc; i += iInc){
								for(var j = _this.startSelectedTile[1]; j != _this.selectedTile[1] + jInc; j += jInc){
									_this.game.currentState.world.map.setTile(
										$(this).attr('data-i')
										, i
										, j
									);

									if(_this.wallCheckbox.prop('checked'))
									{
										_this.game.currentState.world.map.setWall(
											true
											, i
											, j
										);
									}
									else
									{
										_this.game.currentState.world.map.setWall(
											false
											, i
											, j
										);
									}

									_this.game.currentState.viewport.forceBgUpdate();
								}}
							}
							else if(_this.selectedTile)
							{
								_this.game.currentState.world.map.setTile(
									$(this).attr('data-i')
									, _this.selectedTile[0]
									, _this.selectedTile[1]
								);

								if(_this.wallCheckbox.prop('checked'))
								{
									_this.game.currentState.world.map.setWall(
										true
										, _this.selectedTile[0]
										, _this.selectedTile[1]
									);
								}
								else
								{
									_this.game.currentState.world.map.setWall(
										false
										, _this.selectedTile[0]
										, _this.selectedTile[1]
									);
								}

								_this.game.currentState.viewport.forceTileUpdate(
									_this.selectedTile[0]
									, _this.selectedTile[1]
								);
							}

							_this.storeTempMap();

							_this.tilePalletSelection = $(this).attr('data-i');

							$('img.palletImg').removeClass('selectedTile');
							$(this).addClass('selectedTile');

							_this.updateSelection();
						}
					)
			);
		}

		for(var i in objectPallet)
		{
			var testConstructor = objectPallet[i];
			var testObj = new testConstructor;
			
			if(testObj.sprite)
			{
				var spriteSrc = imageCache.loadImage(testObj.sprite.standard()[0]).src;
			}

			//console.log(testObj.name);

			this.objectPalletBox.append(
				$('<img />')
					.attr('id', 'objectPallet_' + i)
					.attr('class', 'palletImg')
					.attr('src', spriteSrc)
					.attr('data-i', i)
					.attr('title', testObj.name)
					.click(
						function(e)
						{
							//Add object
							e.preventDefault();
							if(_this.selectedTile && _this.startSelectedTile)
							{
								var iInc = 1;
								var jInc = 1;

								if(_this.selectedTile[0] < _this.startSelectedTile[0])
								{
									iInc = -1;
								}

								if(_this.selectedTile[1] < _this.startSelectedTile[1])
								{
									jInc = -1;
								}

								for(var i = _this.startSelectedTile[0]; i != _this.selectedTile[0] + iInc; i += iInc){
								for(var j = _this.startSelectedTile[1]; j != _this.selectedTile[1] + jInc; j += jInc){
									var obj = new objectPallet[
										$(this).attr('data-i')
									];

									_this.game.currentState.world.addObject(obj, i, j);

									_this.game.currentState.world.map.addObject(
										$(this).attr('data-i')
										, i
										, j
									);
								}}
							}
							else if(_this.selectedTile)
							{
								var obj = new objectPallet[
									$(this).attr('data-i')
								];

								_this.game.currentState.world.addObject(
									obj
									, _this.selectedTile[0]
									, _this.selectedTile[1]
								);

								_this.game.currentState.world.map.addObject(
									$(this).attr('data-i')
									, _this.selectedTile[0]
									, _this.selectedTile[1]
								);

							}

							_this.storeTempMap();

							_this.game.currentState.viewport.forceBgUpdate();
							_this.updateSelection();
						}
					)
			);
		}

		var effectValue;

		for(var i in effectPallet)
		{
			effectValue = i;

			if(i == null)
			{
				effectValue = 'None';
			}

			this.effectPalletBox.append('<option value = "'+i+'">'+effectPallet[i]+'</option>');
		}
	}
	, updateSelection: function()
	{
		if(!this.selectedTile)
		{
			return;
		}

		this.selectedTileImg.attr("src",
			this.game.currentState.world.map.resolveTile(
				this.game.currentState.world.map.getTile(
					this.selectedTile[0]
					, this.selectedTile[1]
				)
			)
		);

		var objects = this.game.currentState.world.getObjects(
			this.selectedTile[0]
			, this.selectedTile[1]
		);

		if(this.game.currentState.world.map.getWall(
			this.selectedTile[0]
			, this.selectedTile[1]
		)){
			this.wallCheckbox.prop('checked', true);
		}
		else
		{
			this.wallCheckbox.prop('checked', false);
		}

		this.objectPropertyEditor.children().remove();

		this.mapWidthInput.val(this.game.currentState.world.worldWidth);
		this.mapHeightInput.val(this.game.currentState.world.worldHeight);

		this.playerStartXInput.val(this.game.currentState.world.map.start[0]);
		this.playerStartYInput.val(this.game.currentState.world.map.start[1]);

		$('input#mapTitle').val(this.game.currentState.world.map.title);

		this.objectList.children().remove();
		this.objectListTrigger.children().remove();
		this.triggerEditorMenu.children().remove();

		var _this = this;

		if(this.nextSelectCallBack)
		{
			this.nextSelectCallBack(this);
			this.nextSelectCallBack = null;
		}

		for(var i in objects)
		{
			var existingTriggers = _this.game.currentState.world.map.getTriggers(
				objects[i]
			);

			for(var j in existingTriggers)
			{
				var tObj = _this.game.currentState.world.getObjects(
					existingTriggers[j].x
					, existingTriggers[j].y
				)[existingTriggers[j].i];

				if(tObj)
				{
					_this.triggerEditorMenu.append(
						$('<li />').append(
							$('<button />').html('remove').click(
								(function(prevObj, trigger)
								{
									return function()
									{
										_this.game.currentState.world.map.removeTrigger(
											prevObj
											, trigger
										);

										_this.updateSelection();
										_this.game.currentState.viewport.forceBgUpdate();
										_this.storeTempMap();
									}
								})(objects[i], tObj)
							)
						).append(
							objects[i].name
							+ '('
							+ objects[i].x
							+ ', '
							+ objects[i].y
							+ ', '
							+ objects[i].i
							+ ')'
							+ ' triggered by '
							+ tObj.name
							+ '('
							+ tObj.x
							+ ', '
							+ tObj.y
							+ ', '
							+ tObj.i
							+ ')'
						)
					);
				}
			}

			this.objectListTrigger.append(
				$('<li />').html(
					objects[i].i
					+ ": "
					+ objects[i].name
				).append(
					$('<button />')
						.html('addTrigger')
						.click(
							function()
							{
								_this.onNextSelect((function(prevObj)
									{
										return function()
										{
											var tObjs = _this.game.currentState.world.getObjects(
												_this.selectedTile[0]
												, _this.selectedTile[1]
											);

											for(var i in tObjs)
											{
												_this.triggerEditorMenu.append(
													$('<li />').append(
														$('<button />').html('add').click(
															(function(trigger)
															{
																return function()
																{
																	_this.game.currentState.world.map.addTrigger(
																		prevObj
																		, trigger
																	);

																	_this.updateSelection();
																	_this.game.currentState.viewport.forceBgUpdate();
																	_this.storeTempMap();
																}
															})(tObjs[i])
														)
													).append(
														'trigger '
														+ prevObj.name
														+ '('
														+ prevObj.x
														+ ', '
														+ prevObj.y
														+ ', '
														+ prevObj.i
														+ ')'
														+ ' with '
														+ tObjs[i].name
														+ '('
														+ tObjs[i].x
														+ ', '
														+ tObjs[i].y
														+ ', '
														+ tObjs[i].i
														+ ')'
													)
												);
											}
										}
									})(objects[i])
								);
							}
						)
				)
			);

			this.objectList.append(
				$('<li />').html(
					objects[i].i
					+ ": "
					+ objects[i].name
				).append(
					$('<button />')
						.html('remove')
						.attr('data-x', this.selectedTile[0])
						.attr('data-y', this.selectedTile[1])
						.attr('data-i', objects[i].i)
						.click(
							function(e)
							{
								//Remove object
								e.preventDefault();
								_this.game.currentState.world.getObjects(
									$(this).attr('data-x')
									, $(this).attr('data-y')
								)[$(this).attr('data-i')].destroy(true);

								_this.game.currentState.world.map.removeObject(
									$(this).attr('data-x')
									, $(this).attr('data-y')
									, $(this).attr('data-i')
								);

								_this.updateSelection();
								_this.game.currentState.viewport.forceBgUpdate();
								_this.storeTempMap();
							}
					)
				).append(
					$('<button />')
						.html('edit')
						.attr('data-x', this.selectedTile[0])
						.attr('data-y', this.selectedTile[1])
						.attr('data-i', objects[i].i)
						.click(
							function(e)
							{
								e.preventDefault();
								_this.objectPropertyEditor.children().remove();

								var objX = $(this).attr('data-x');
								var objY = $(this).attr('data-y');
								var objI = $(this).attr('data-i');

								var obj = _this.game.currentState.world.getObjects(objX, objY)[objI];

								var propertyTable = $('<table>');
								var valueInputs = [];

								for(var prop in obj)
								{
									if(obj[prop] !== Object(obj[prop]))
									{
										var propertyRow = $('<tr>');

										propertyTable.append(propertyRow);

										valueInputs[prop] = $('<td>').append(
											$('<input>').attr(
												'type', 'text'
											).attr(
												'id', 'prop_' + prop
											).val(obj[prop])
										);

										propertyRow.append(
											$('<td>').html(prop)
										).append(
											valueInputs[prop]
										).append(
											$('<button>').html('apply')
												.attr('data-prop', prop)
												.attr('data-input-ref', 'input#prop_' + prop)
												.click(
													function()
													{
														_this.game.currentState.world.map.appendObjectInit(
															objX
															, objY
															, objI
															, $(this).attr('data-prop')
															, $($(this).attr('data-input-ref')).val()
														)

														_this.storeTempMap();
														_this.refresh();
													}
												)
										);

										_this.objectPropertyEditor.append(propertyRow);
									}
								}

								_this.storeTempMap();
							}
						)
				)
			);
		}

		this.objectList.append(
			$('<button />').html('clear')
				.attr('data-x', this.selectedTile[0])
				.attr('data-y', this.selectedTile[1])
				.click(
					function(e)
					{
						_this.objectPropertyEditor.children().remove();

						if(_this.selectedTile && _this.startSelectedTile)
						{
							var iInc = 1;
							var jInc = 1;

							if(_this.selectedTile[0] < _this.startSelectedTile[0])
							{
								iInc = -1;
							}

							if(_this.selectedTile[1] < _this.startSelectedTile[1])
							{
								jInc = -1;
							}

							for(var i = _this.startSelectedTile[0]; i != _this.selectedTile[0] + iInc; i += iInc){
							for(var j = _this.startSelectedTile[1]; j != _this.selectedTile[1] + jInc; j += jInc){

								var objects = _this.game.currentState.world.getObjects(i, j);

								for(var k in objects)
								{
									obj = _this.game.currentState.world.map.removeObject(
										i
										, j
										, 0
									);

									console.log(obj);

									objects[k].destroy();
								}

							}}
						}
						else if(_this.selectedTile)
						{
							var objects = _this.game.currentState.world.getObjects(
								$(this).attr('data-x')
								, $(this).attr('data-y')
							);

							for(var i in objects)
							{
								console.log(i);
								_this.game.currentState.world.map.removeObject(
									$(this).attr('data-x')
									, $(this).attr('data-y')
									, objects.i
								);
							}
						}

						_this.storeTempMap();
						_this.refresh();
						_this.updateSelection();
					}
				)
		);
	}
	, unselectTile: function()
	{
		this.selectedTile = null;
		this.startSelectedTile = null;
	}
	, selectTile: function(x, y)
	{
		this.selectedTile = [x, y];

		var startText = '';

		if(this.startSelectedTile.toString()
			&& this.startSelectedTile.toString() === this.selectedTile.toString()
		){
			this.startSelectedTile = null;
		}

		if(this.startSelectedTile)
		{
			startText = '(' + this.startSelectedTile[0] + ', ' + this.startSelectedTile[1] + ') to ';
		}

		this.selectedTileText.html(
			startText + '(' + x + ', ' + y + ')'
		);

		this.updateSelection();
	}
	, startSelectTile: function(x, y)
	{
		this.game.currentState.viewport.resize();

		this.startSelectedTile = [x, y];

		this.selectedTileText.html(
			'(' + x + ', ' + y + ')'
		);

		this.updateSelection();
	}
	, refresh: function()
	{
		var mainActor = this.game.currentState.world.viewport.actor;

		if(mainActor)
		{
			var x = mainActor.x;
			var y = mainActor.y;
			var i = mainActor.i;

			this.game.currentState.world.map.refreshObjects();

			this.game.currentState.world.removeObject(
				mainActor.x
				, mainActor.y
				, mainActor.i
			);
		}

		if(!mainActor || mainActor.name !== 'Player')
		{
			mainActor = new Player();

			this.game.currentState.world.addObject(
				mainActor
				, this.game.currentState.world.map.start[0]
				, this.game.currentState.world.map.start[1]
			);
		}
		else
		{
			this.game.currentState.world.addObject(
				mainActor
				, x
				, y
			);
		}

		this.game.currentState.viewport.bindCamera(mainActor);
	}
	, update: function()
	{
		if(!this.game.currentState.viewport)
		{
			return;
		}

		var _this = this;
		if(this.game.dev)
		{
			if(!this.display)
			{
				this.controlPanel.slideDown(
					250, function()
					{
						_this.game.currentState.viewport.resize();
					}
				);

				$('tr.editorRow').hide(0);

				this.refresh();

				this.display = true;
			}
		}

		if(!this.game.dev)
		{
			if(this.display)
			{
				this.controlPanel.slideUp(
					250, function()
					{
						_this.game.currentState.viewport.resize();
					}
				);

				this.unselectTile();

				this.display = false;
			}

			return;
		}

		if(this.init)
		{
			this.populatePallet();
			this.updateSelection();

			this.init = false;
		}

		if(this.game.clickVectors[0]
			&& this.game.clickVectors[0].endX > this.game.currentState.viewport.canvasOffsetX
			&& this.game.clickVectors[0].endX < this.game.currentState.viewport.canvasOffsetX
				+ this.game.currentState.viewport.renderWidth
			&& this.game.clickVectors[0].endY > this.game.currentState.viewport.canvasOffsetY
			&& this.game.clickVectors[0].endY < this.game.currentState.viewport.canvasOffsetY
				+ this.game.currentState.viewport.renderHeight
		){
			if(this.game.clickVectors[0]
				&& !this.game.clickVectors[0].released
				&& this.game.clickVectors[0].undragged
			){
				var startMouseTile = this.getMouseTile();

				var isOnMap = this.game.currentState.world.map.isTileOnMap(
					startMouseTile[0], startMouseTile[1]
				);

				if(isOnMap)
				{
					this.unselectTile();
					this.startSelectTile(startMouseTile[0], startMouseTile[1]);
				}
			}

			if(this.game.clickVectors[0]
				&& this.game.clickVectors[0].released
			){
				var mouseTile = this.getMouseTile();

				var isOnMap = this.game.currentState.world.map.isTileOnMap(
					mouseTile[0], mouseTile[1]
				);

				if(isOnMap)
				{
					this.selectTile(mouseTile[0], mouseTile[1]);
				}

				//this.game.currentState.viewport.resize();
			}
		}

		//console.log('update done');
		return;
	}
	, getMouseTile: function()
	{
		return [
			this.game.currentState.viewport.mouseTile[0]
				+ this.game.currentState.viewport.xPosition
			, this.game.currentState.viewport.mouseTile[1]
				+ this.game.currentState.viewport.yPosition
		];
	}
	, storeTempMap: function()
	{
		localStorage.setItem('tempMap', this.game.currentState.world.map.getData());
	}
	, tempMapExists: function()
	{
		return !!localStorage.getItem('tempMap');
	}
	, loadTempMap: function()
	{
		this.game.currentState.world.map.setData(localStorage.getItem('tempMap'));
	}
	, clearTempMap: function()
	{
		localStorage.getItem('tempMap') = undefined;
	}
});
