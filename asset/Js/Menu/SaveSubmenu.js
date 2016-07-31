var SaveSubmenu = function(game)
{
	var dynMenu = new Menu(game);

	var endpoint = '/clonesNBarrels/saveState/mySaves';
	
	var data = JSON.parse($.ajax({
		url: endpoint
		, dataType: 'json'
		, async: false
		, data:{api: 'json'}
	}).responseText);

	for(var i in data)
	{
		dynMenu.options[data[i]['title']] = (function()
		{
			var stateId = data[i]['id'];

			return function()
			{
				game.changeState('main', {}, true);

				var saveState = new SaveState();

				saveState.publicId = stateId;

				var world = game.currentState.world;

				saveState.load(world);
			}
		})();
	}

	if(!dynMenu.options)
	{
		dynMenu.options['no saves found. return?'] = function(){
			game.restoreState();
		};
	}
	else
	{
		dynMenu.options['back'] = function(){
			game.restoreState();
		};
	}

	game.stackState(
		'menu'
		, {menu: dynMenu}
		, true
	);

	return;

	var dynMenu = new Menu(game);



	game.stackState(
		'menu'
		, {menu: dynMenu}
		, true
	);
};
