<?php
namespace SeanMorris\ClonesNBarrels\View;
class Play extends \SeanMorris\Theme\View
{

}
__halt_compiler(); ?>
<!doctype HTML>
<div id = "outer">
	<div id = "inner">
		<canvas tabindex="0">Oops.</canvas>
		<table id = "editor">
			<tr>
				<td id = "modeSwapper" colspan = "2">
					<button id = "tileMode">Tile Mode</button>
					<button id = "objectMode">Object Mode</button>
					<button id = "triggerMode">Trigger Mode</button>
					<button id = "mapMode">Map Mode</button>
					<button id = "tileEffectMode">Tile Effect Mode</button>
				</td>
			</tr>
			<tr id = "tileEditor" class = "editorRow tileEditorRow">
				<td id = "tileEditorSelection">
					Selected Tile:<br />
					<img id = "tileEditorSelectionImg" /><br />
					<span id = "editorSelection"></span><br />
					<input type = "checkBox" id = "wallBool">Wall
				</td>
				<td id = "tileEditorPallet">
					Tile Pallet:
					<div id = "tileEditorPalletBox"></div>
				</td>
			</tr>
			<tr id = "objectEditor" class = "editorRow objectEditorRow">
				<td id = "objectEditorSelection">
					Objects on tile:<br />
					<ul id = "objectList"></ul>
				</td>
				<td id = "objectEditorPallet">
					Object Pallet:<br />
				</td>
			</tr>
			<tr id = "objectEditor2" class = "editorRow objectEditorRow">
				<td>
				</td>
				<td id = "objectPropertyEditorCell">
					<div id = "objectPropertyEditor"></div>
				</td>
			</tr>
			<tr id = "triggerEditor" class = "editorRow triggerEditorRow">
				<td id = "triggerEditorSelection">
					Objects on tile:<br />
					<ul id = "objectListTrigger"></ul>
				</td>
				<td id = "triggerEditorCell">
					<div id = "triggerEditor">
						<ul id = "triggerEditorMenu"></ul>
					</div>
				</td>
			</tr>
			<tr id = "mapEditor" class = "editorRow mapEditorRow">
				<td colspan = "2">
					<table>
						<tr>
							<td>
								Map Title: <input id = "mapTitle" type = "text" />
								<button id = "setMapTitle">Set</button><br />
								<button id = "saveMap">Save Map</button><br /><br /><br />
								<button id = "downloadMap">Download Map</button><br /><br /><br />
								Load Map: <input id = "loadMap" type = "file"/><br />
							</td>
							<td>
								Map Width: <input id = "mapWidth" type = "text" /><br />
								Map Height: <input id = "mapHeight" type = "text" /><br />
								<button id = "setMapSize">Set</button>
							</td>
							<td>
								Player Start X: <input id = "playerStartX" type = "text" /><br />
								Player Start Y: <input id = "playerStartY" type = "text" /><br />
								<button id = "setStart">Set</button>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr id = "tileEffectEditor" class = "editorRow tileEffectEditorRow">
				<td id = "tileEffectEditorSelection">
					Effect: <select id = "tileEffectPallet" name = "tileEffectSelect">

					</select><br />
					<button id = "setTileEffect">Set</button>
					<button id = "clearTileEffect">Clear</button>
				</td>
				<td id = "tileEffectEditorCell">

				</td>
			</tr>
		</table>
	</div>
</div>