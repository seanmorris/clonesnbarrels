var BarrelSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:barrel.png'
				//'sprite:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAwCAYAAABwrHhvAAAFlElEQVRYR61Yz0tcVxQ+SbSEUavGN1UjBqud6EJlLFZba0GKlGZhUdBFuqqLuhI3Ii6TLEX8B9z4Byi4GIoutNqFFtGOIwpRpxitGE0cURPx12infHc4jzt37vsxTQ4M79777tzvu98595z33h1yaenp6TE3U6PR6B0383iO7WSfzxfb3t6mjo4Oampqclx3dnZWzFlcXBTXcDjsSEY7AbstKSmhvr4+sdDY2JgjOE8wDMMkOzg4SNiAnSoJBGTgYDBIW1tbVFpaSl6v1zUBnriwsEDt7e2i29/fT2dnZ1oiJgGAZ2Zm0sDAgNgxgNlAoLi42Ozn5eUlEDo6OkoiiA3AsAkQsSJhEsjNzY3ZgQO0pqZGLHp+fi6uGxsb4gpyoVAogSCT2t3dJVYDJI6PjxNU1xKAH2FlZWXk9/tFm8EjkQjxfUbEmMfjofn5eTHECoEEu5JVsCXQ3d0tdsNBV19fb+4QDZAB+PLycsI4dglTXcHrABwnZGJiwl6BoqIiqq6uNqOYFwAo1GCT4wFjTEAOQLQ5CLu6uqiyspL29vbsCfzU4qc/tzbpk5NcWltbo+HhYbFmKsdQBUb/cWMR5RjZFP5j35mAHM5/BQ9Ft62tTbiGfasqIP8nEAjQ+Pg4XeccU8Gjz8xbl+dX7ggUFHgIP7ZQKCKaTEYG07Vl4M/TcujVzYmYlhKBH588En8KLcfB2Q4O4scvFcN/Xr57Q/feZNP6+rq1C5CIfn7aKHaPn7/GSCLgFpiJ8hUEYMu/hZOyoZkHent7Y5HDePaSSUxO/JPgEh0JVRnuQ364gQl8V/aEhoaG9ImopaUl9iD3zFzf7zdIXZhjA+No61yiG2MC+bdlFAgE9ATggp6eHkq7ty4WlgORWWEMQckK2cWEfO/bxqciEY2Ojlq7AARqa2ups7NT5HgQgVmRcXIFSN7cVlB5eTmNjIyI6UtLS/YEEISb4UsxGURgTIZ3ZCU9xw6Dos/At/mnzkHIp4B3xkTQb25uFsNcmC4uLkSfqyLanI6npqZMcR777ou2q1OgEpBjALvH7937u5Yn8dOsf7Vxw+CX55f0cmbX2QWMoDsFqeYBnp+yAgwuHzu34HLgchbEWEoK/NJZIbKgXR6wIiSfGrSRjFAHYLaZEDHwTUelyFxQgI39r+YFnToqONb4XwSgAIxVUMHlTGh3LD+KArISuuzIPlddItcDVy5AMVrc/124wG1F1NUEuxhwXYx4p2rxsVLDqiaoLnBVjFCSraRmAnZ+V12CILz7OpuysrJocnLSPhFVVVWJF1E853NVxIJOhGRl5FgA+FeF34tHeVTC1dVVewI4hmfr8XINIjCQkR9U3JwAw/ulAN3c3KSVlRWxzo1x4pyKQQCGQFxdi1cwWF1dHWVkZFBDQ4PoczFCW34n2NnZoaurKxMU9zMrYnQSia/lWAs4EalHiv16GInqbpljXiM9wV1wAYMzgexs74tI5PVz/lPC27GsgFUd4Oc8LMCP3FBM9b3clxUAgbhr4yS0BF78+jXhYRSP57jKx0wmwCRUAjI5tFMmgAWRjgHO8vPRS6VCskI6AqyCVgEORBWUydgFAoOqLkA6frXwltgFSQTwWI63V0Qtm05avseu0AGqBFmBAvqCgsE1EQNaBfBYPjMzI84sDG+0H2oAx+4fpvlobm7OWgHDePj89PTwWWFhoUhCSCJQJFUy8rFrKP1BfCPCO+H+/n4CeJICIMC7lYlgDCn0gP42xUiL5AhifOUbGe/zRc7HBy47YO0xxKBMAn0mwgCtra3m1zPOgNFolK6vr0UGnJ6eFlOxW5gccKork/IAT1BJ8LjHk/ZMFw8MxvfsQOXg47blp1QrIh8alHIaxlq233I/NgkV3JGAk1vcqqEDdnSB1eKpqGIHzOv/B0Ki8F4MWCFQAAAAAElFTkSuQmCC'
			]
		};
	}
});