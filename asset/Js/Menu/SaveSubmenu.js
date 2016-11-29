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

	for(var i in data.body)
	{
		dynMenu.options[data.body[i]['title']] = (function()
		{
			var stateId = data.body[i]['id'];

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

	for(var i in data.messages)
	{
		game.message.blit(data.messages[i]);
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
