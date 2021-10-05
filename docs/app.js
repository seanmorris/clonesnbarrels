/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2013-01-23
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*This software is licensed under the MIT/X11 license.

MIT/X11 license
---------------

Copyright &copy; 2011 [Eli Grey][1].

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  || (navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator))
  || (function(view) {
	"use strict";
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				save_link.href = object_url;
				save_link.download = name;
				click(save_link);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			} else {
				target_view = view.open();
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
}(self));
//Scott Andrew
function createCookie(name,value,seconds) {
	if (seconds) {
		var date = new Date();
		date.setTime(date.getTime()+(seconds));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}
function Menu(game)
{
	this.cacheBg				= null;
	this.ignoreInput			= 0;
	this.ignoreInputTime		= 5;
	this.options				= [];

	this.selected = 0;
	this.selectedOption;

	this.bgColor				= '#111';
	this.bgAlpha				= 0.75;

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
					&& game.clickVectors[0].startX > center[0]
						+ this.leftMargin
						+ $(this.context.canvas).offset().left
						- this.selectedBoxSize
				)
			){
				var selectOffset = 0;
				var yClick = 0;

				if(game.clickVectors[0])
				{
					yClick = game.clickVectors[0].startY
						- $(this.context.canvas).offset().top
						- this.topMargin
						- this.boxSize
						- this.margins;
				}

				var interval = this.boxSize + this.margins;

				if(yClick >= 0 && yClick < (this.selectedBoxSize + this.margins))
				{
					if((game.clickVectors[0] && game.clickVectors[0].released))
					{
						this.select(this.selected);
					}
					else
					{
						this.preselect(this.selected);
					}
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
						if((game.clickVectors[0] && game.clickVectors[0].released))
						{
							this.select(this.selected+selectOffset);
						}
						else
						{
							this.preselect(this.selected+selectOffset);
						}
					}
				}
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

	this.preselect	= function(option)
	{
		for(var i in this.options)
		{
			if(!option-- && this.options[i].preselect)
			{
				this.options[i].preselect();
			}
		}
	}
}
var MusicSubmenu = function(game)
{
	var dynMenu = new Menu(game);

	dynMenu.options['play/pause'] = function()
	{
		game.bgm.play()
	};
	
	dynMenu.options['next'] = function()
	{
		game.bgm.next()
	};
	
	dynMenu.options['previous'] = function()
	{
		game.bgm.previous()
	};
	
	dynMenu.options['back'] = function(){
		game.restoreState();
	};

	game.stackState(
		'menu'
		, {menu: dynMenu}
		, true
	);
};

var MuteSubmenu = function(game)
{
	
};function MainMenu(game)
{
	var menu = new Menu(game);

	for(var i in menu)
	{
		this[i]		= menu[i];
	}
	
	this.options				= [];

	this.options['new game']	= function()
	{
		game.flushStates();
		game.message.blit('Welcome.');
		game.changeState('main', {}, true);
	};

	// var whoAmI = JSON.parse($.ajax({
	// 	url: 'user/current'
	// 	, dataType: 'json'
	// 	, async: false
	// 	, data:{api: 'json'}
	// }).responseText);

	var _this = this;

	console.log(_this);

	var nextPopped = focusPopped = false;

	if(0 /*whoAmI.body.id*/)
	{1
		this.options['load game']   = SaveSubmenu;

		this.options['log out']     = function()
		{
			
		};

		this.options['log out'].preselect = function()
		{
			if(!nextPopped)
			{
				game.onNextUp(function()
				{
					window.open('/user/logout?page=close', '_blank');
					nextPopped = false;
				});
			}
			if(!focusPopped)
			{
				game.onNextFocus(function()
				{
					game.changeState(
						'menu'
						, {menu: MainMenu(game)}
						, true
					);
					focusPopped = false;
				});
			}
			nextPopped = focusPopped = true;
		}
	}
	else
	{
		// this.options['login via facebook'] = function()
		// {
		// };

		// this.options['login via facebook'].preselect = function()
		// {
		// 	if(!nextPopped)
		// 	{
		// 		game.onNextUp(function()
		// 		{
		// 			window.open('/user/facebookConnect?page=close', '_blank');
		// 			nextPopped = false;
		// 		});
		// 	}
		// 	if(!focusPopped)
		// 	{
		// 		game.onNextFocus(function()
		// 		{
		// 			game.changeState(
		// 				'menu'
		// 				, {menu: MainMenu(game)}
		// 				, true
		// 			);
		// 			focusPopped = false;
		// 		});
		// 	}
		// 	nextPopped = focusPopped = true;
		// };
	}

	this.options['music']		= MusicSubmenu;
	this.options['mute']		= function()
	{
		var muted = parseInt(localStorage.getItem('muted'));
		game.bgm.play(muted);
		localStorage.setItem('muted', muted ? "0" : "1");
		game.message.blit(!muted ? 'Sound muted.' : 'Sound on.');
	};
}
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

	this.topMargin  = -15;

	this.beepNoise = BeepNoise;

	var width   = game.canvas.width();
	var height  = game.canvas.height();

	if(text)
	{
		this.lines = text.split(/\n/);
		this.lineCount = this.lines.length;
		console.log(this.lines);
	}

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
			, (height/8)*2 + this.lineCount * 35 
		);

		context.globalAlpha = 1;
		context.fillStyle = '#FFF';

		context.font = '18pt monospace';
		context.textAlign = 'center';

		for(var i in this.lines)
		{
			context.fillText(
				this.lines[i]
				, center[0] + this.leftMargin
				, center[1] + (this.topMargin) + i * 35
			);
		}
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
function PauseMenu(game)
{
	var menu = new MainMenu(game);

	for(var i in menu)
	{
		this[i]		= menu[i];
	}
	this.options				= [];
	this.options['resume']		= function()
	{
		game.restoreState();
	};

	this.options['new game']	= function()
	{
		game.flushStates();
		game.message.blit('Welcome back.');
		game.changeState('main', {}, true);
	};

	var whoAmI = JSON.parse($.ajax({
		url: 'user/current'
		, dataType: 'json'
		, async: false
		, data:{api: 'json'}
	}).responseText);

	var nextPopped = focusPopped = false;
	
	if(whoAmI.body.id)
	{
		this.options['load game']   = SaveSubmenu;

		this.options['save game']	= function()
		{
			var saveState = new SaveState();
			var world = game.stateStack[0].world;

			if(saveState.save(world))
			{
				game.message.blit('Saved "' + world.saveStateTitle + '".', 300);
			}
			else
			{
				var messages = saveState.getMessages();
				for(var i in messages)
				{
					game.message.blit(messages[i], 300);
				}
			}


			game.restoreState();
		};
		
		this.options['log out']     = function()
		{
			
		};

		var _this = this;

		this.options['log out'].preselect = function()
		{
			game.onNextUp(function()
			{
				window.open('/user/logout?page=close', '_blank');
				game.restoreState();
			});
		}

		this.options['log out']     = function()
		{
			
		};

		this.options['log out'].preselect = function()
		{
			if(!nextPopped)
			{
				game.onNextUp(function()
				{
					window.open('/user/logout?page=close', '_blank');
					nextPopped = false;
				});
			}
			if(!focusPopped)
			{
				game.onNextFocus(function()
				{
					game.flushStates();
					game.stackState(
						'menu'
						, {menu: new PauseMenu(game)}
					);
					focusPopped = false;
				});
			}
			nextPopped = focusPopped = true;
		}
	}
	else
	{
		this.options['login via facebook'] = function()
		{
		};

		this.options['login via facebook'].preselect = function()
		{
			if(!nextPopped)
			{
				game.onNextUp(function()
				{
					window.open('/user/facebookConnect?page=close', '_blank');
					nextPopped = false;
				});
			}
			if(!focusPopped)
			{
				game.onNextFocus(function()
				{
					game.flushStates();
					game.stackState(
						'menu'
						, {menu: new PauseMenu(game)}
						, false
					);
					focusPopped = false;
				});
			}
			nextPopped = focusPopped = true;
		};
	}

	this.options['music']		= MusicSubmenu;
	this.options['mute']		= function()
	{
		var muted = parseInt(localStorage.getItem('muted'));
		game.bgm.play(muted);
		localStorage.setItem('muted', muted ? "0" : "1");
		game.message.blit(!muted ? 'Sound muted.' : 'Sound on.');
	};


	this.options['back'] = function(){
		game.restoreState();
	};

	/*

	this.options['help']		= function()
	{
		//console.log('unimplemented');
	};

	this.options['credits']		= function()
	{
		//console.log('unimplemented');
	};

	this.options['dynamic'] = function()
	{
		var dynMenu = new Menu(game);

		dynMenu.options['a'] = function()
		{
			var dynMenu = new Menu(game);

			dynMenu.options['1'] = function(){};
			dynMenu.options['2'] = function(){};
			dynMenu.options['3'] = function(){};

			dynMenu.options['back'] = function(){
				game.restoreState();
			};

			game.stackState(
				'menu'
				, {menu: dynMenu}
				, true
			);
		};
		dynMenu.options['b'] = function(){};
		dynMenu.options['c'] = function(){};

		dynMenu.options['back'] = function(){
			game.restoreState();
		};

		game.stackState(
			'menu'
			, {menu: dynMenu}
			, true
		);
	};

	*/
}
function DialogMenu()
{
	this.context	= null;

	this.render = function()
	{
		if(!this.context)
		{
			this.context= this.dialog.game.canvas[0].getContext('2d');

			var width   = this.context.canvas.width;
			var height  = this.context.canvas.height;
		}

		this.dialog.render();

		//this.context.save();

		this.context.strokeStyle = '#FF0';
		/*this.context.strokeRect(
			0
			, (height/8)*3 - (this.dialog.lineCount * 25)
			, width
			, (height/8)*2 + (this.dialog.lineCount * 50)
		);
		*/

		//this.context.clip();

		this.menu.context = this.context;

		//this.menu.leftMargin = 250;
		this.menu.topMargin = 250 + this.dialog.lineCount * 35;
		this.menu.render(true);

		//this.context.restore();
	}

	this.update = function(input)
	{
		this.menu   && this.menu.update(input);
		this.dialog && this.dialog.update({});
	}
}
function ContinueMenu(game)
{
	var menu = new Menu(game);

	for(var i in menu)
	{
		if(menu[i] instanceof Function)
		{
			this[i]	= menu[i].bind(this);
			continue;
		}

		this[i]		= menu[i];
	}
	
	this.options				= [];
	this.options['continue']	= function()
	{
		game.restoreState();
	};
}
var SaveSubmenu = function(game)
{
	var dynMenu = new Menu(game);
	var endpoint = 'saveState/mySaves';

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

	var whoAmI = JSON.parse($.ajax({
		url: 'user/current'
		, dataType: 'json'
		, async: false
		, data:{api: 'json'}
	}).responseText);

	for(var i in data.messages)
	{
		game.message.blit(data.messages[i]);
	}

	if(!whoAmI.body.id)
	{
		dynMenu.options['login via facebook'] = function()
		{			
			
		};

		dynMenu.options['login via facebook'].preselect = function()
		{
			game.onNextUp(function()
			{
				window.open('/user/facebookConnect', '_blank');
			});
			game.onNextFocus(function(){
				game.stackState(
					'menu'
					, {menu: new dynMenu}
					, true
				);
			});
		};
	}
	else if(!dynMenu.options)
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
var BeepNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/beep.wav');
var Actor = Class.extend({
	init: function(sprite)
	{
		this.sprite = sprite;
		this.originalSprite = new (Class.extend(sprite));
		this.deathNoteColor = null;

		this.preloadSprite();

		this.frames = [];
		this.world = null;
		this.renderCount = 0;

		this.x = null;
		this.y = null;
		this.i = null;

		this.tileOffsetX = 0;
		this.tileOffsetY = 0;

		this.direction = 0;
		this.nextDirection = null;

		this.stepTime   = 6;
		this.stepTimer  = 0;
		this.stepSpeed	= this.stepTime;

		this.justStepped = false;

		this.stepping	= false;
		this.requestedStep = false;

		this.frameCache	= {};

		this.drawOffsetX	= 0;
		this.drawOffsetY	= 0;

		this.currentFrame	= 0;

		this.frameTime		= 2;
		this.frameTimer		= 0;

		this.RIGHT	= 0;
		this.DOWN	= 1;
		this.LEFT	= 2;
		this.UP		= 3;

		this.EAST	= this.RIGHT;
		this.SOUTH	= this.DOWN;
		this.WEST	= this.LEFT;
		this.NORTH	= this.UP;

		this.holding	= null;
		this.heldBy		= null;
		this.holdX 		= null;
		this.holdY 		= null;
		this.holdDirection = null;
		this.wasHeld	= null;
		this.wasHeldBy	= null;

		this.updateWith = null;

		this.bumpNoise	= BeepNoise;

		this.pushed		= false;
		this.pusher		= null;
		this.crusher 	= null;

		this.stateVars = [
			'x',
			'y',
			'i',
			'direction', 
			'name'
		];

		this.ghost = false;
	}
	, reinit: function(sprite)
	{
		this.sprite = sprite;
	}
	, hold: function(otherActor)
	{
		this.holding = otherActor;

		this.holdX = this.x - this.holding.x;
		this.holdY = this.y - this.holding.y;
		this.holdDirection = this.direction;

		otherActor.heldBy = this;

		console.log('GRABBING');
	}

	, stopHolding: function()
	{
		if(this.holding)
		{
			console.log('DROPPING');
			this.holding.wasHeldBy = this;
			this.holding.heldBy = null;
			this.holding = null;
			this.holdX = null;
			this.holdY = null;
			this.holdDirection = null;
		}
	}

	, resetSprite: function()
	{
		console.log(this.sprite);
		this.sprite = this.originalSprite.clone();
		console.log(this.sprite);
	}
	, preloadSprite: function()
	{
		for(var animation in this.sprite)
		{
			for(var direction in this.sprite[animation])
			{
				var _this = this;

				for(var frame in this.sprite[animation][direction])
				{
					if(animation != 'standard')
					{
						imageCache.loadImage(
							this.sprite[animation][direction][frame]
						);
					}
				}
			}
		}
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		if(!this.frames.length)
		{
			this.frames = this.sprite.standard();
		}

		if(this.currentFrame >= this.frames.length)
		{
			this.currentFrame = 0;
		}

		var frameSrc = this.frames[this.currentFrame];

		if(frameSrc)
		{
			var _this = this;
			this.itemImg = imageCache.loadImage(frameSrc);

			var tileOffsetY = this.tileOffsetY;

			if(this.heldBy)
			{
				tileOffsetY += this.heldBy.tileOffsetY;
			}

			if(this.itemImg.complete)
			{
				if(!this.heightRatio)
				{
					this.heightRatio = this.itemImg.height/this.itemImg.width;
				}

				context.drawImage(
					this.itemImg
					, xPos + this.getOffsetX(size)
						+ this.tileOffsetX
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ tileOffsetY
					, size
					, size * this.heightRatio
				);
			}
		}

		if(this.holding && this.holdDirection == this.LEFT)
		{
			this.holdingSprite = imageCache.loadImage('/SeanMorris/ClonesNBarrels/Img/free/handIconLeft.png');
		}
		else if(this.holding)
		{
			this.holdingSprite = imageCache.loadImage('/SeanMorris/ClonesNBarrels/Img/free/handIcon.png');
		}
		else
		{
			this.holdingSprite = null;
		}

		if(this.holdingSprite && this.holdingSprite.complete)
		{
			if(this.holdDirection == this.LEFT)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						- 3
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ 25
				);
			}
			if(this.holdDirection == this.DOWN)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						- 10
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ size
				);
			}
			else if(this.holdDirection == this.RIGHT)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						+ size
						- 12
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ 25
				);
			}
			if(this.holdDirection == this.UP)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						- 5
					, yPos + this.getOffsetY(size)
						- 15
				);
			}
		}

		this.renderCount++;
	}

	, update: function()
	{
		if(!this.itemImg)
		{
			this.itemImg    = new Image();
		}

		if(!this.frames)
		{
			this.frames = [];
		}

		if(!this.frames.length)
		{
			this.frames = this.sprite.standard();
		}

		if(this.frameTimer < this.frameTime)
		{
			this.frameTimer++;
		}
		else
		{
			this.currentFrame++;
			this.frameTimer	= 0;
		}

		if(this.currentFrame >= this.frames.length)
		{
			this.currentFrame = 0;
		}

		if(this.stepTimer > 0)
		{
			this.stepTimer--;
		}

		if(this.stepTimer == 0)
		{
			this.stepping 		= false;
			this.drawOffsetX	= 0;
			this.drawOffsetY	= 0;
		}

		if(this.holding)
		{
			this.holding.update();
			if(this.holding)
			{
				this.holding.direction = this.direction;
				if(this.holding
					&& this.holding.x !== this.x
					&& this.holding.y !== this.y
				){
					this.stopHolding();
				}
			}
		}

		if(this.pushed)
		{
			this.pushed = false;
		}
		else
		{
			this.pusher = null;
		}

		this.requestedStep = false;

		if(this.world && this.i !== null)
		{
			var tileEffect = this.world.map.getTileEffect(
				this.x, this.y
			);

			tileEffect = this.world.map.tileEffectPallet[tileEffect];

			if(tileEffect && this[tileEffect] && typeof(this[tileEffect]) === 'function')
			{	
				this[tileEffect]();
			}
		}
	}

	, getOffsetX: function(size)
	{
		if(this.stepTimer)
		{
			return this.drawOffsetX
				* size
				* (this.stepTimer/this.stepTime);
		}

		return 0;
	}

	, getOffsetY: function(size)
	{
		if(this.stepTimer)
		{
			return this.drawOffsetY
				* size
				* (this.stepTimer/this.stepTime);
		}

		return 0;
	}

	, bindWorld: function(world)
	{
		this.world  = world;
	}

	, setPosition: function(x, y, i)
	{
		this.x = parseInt(x);
		this.y = parseInt(y);
		this.i = parseInt(i);
		
		if(this.i!==this.i)
		{
			this.i = null;
		}
	}
	, steppedOn: function(stepper, testCall)
	{
		if(!testCall)
		{
			if(this.heldBy !== stepper)
			{
				this.collide(stepper)
			}
		}
		return false;
	}
	, turn: function(direction)
	{
		this._turn(direction);
	}
	, _turn: function(direction)
	{
		if(!this.stepping)
		{
			this.direction = direction % 4;
		}
	}
	, turnNext: function(direction)
	{
		this.nextDirection = direction;
	}
	, canSpawn: function()
	{
		return this.canBeSteppedOn();
	}
	, canStep: function(testCall)
	{
		if(this.ghost)
		{
			return true;
		}

		var stepX   = 0;
		var stepY   = 0;
		var direction = this.direction;

		if(this.nextDirection !== null)
		{
			var direction = this.nextDirection;
		}

		if(direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(direction == this.UP)
		{
			stepY				= -1;
		}

		if(this.world.isWall(
			parseInt(this.x)+stepX
			,parseInt(this.y) + stepY
		)){
			return false;
		}

		var objects = this.world.getObjects(
			parseInt(this.x) + stepX
			, parseInt(this.y) + stepY
		);

		for(var i in objects)
		{
			if(objects[i]
				&& !objects[i].canBeSteppedOn(this)
				&& !objects[i].canBePushed(this)
			){
				return false;
			}
		}

		return true;
	}
	, whyCantStep: function()
	{
		var stepX   = 0;
		var stepY   = 0;
		var direction = this.direction;

		if(this.nextDirection !== null)
		{
			var direction = this.nextDirection;
		}

		if(direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(direction == this.UP)
		{
			stepY				= -1;
		}

		return (
			this.world.getObjects(
				parseInt(this.x) + stepX
				, parseInt(this.y) + stepY
			)
		);
	}
	, push: function(pusher)
	{
		this.pusher = pusher;
		this.pushed = true;
		return false;
	}
	, canBePushed: function()
	{
		return false;
	}
	, canBeSteppedOn: function()
	{
		return false;
	}
	, step: function(speed)
	{
		this._step(speed);
	}
	, _step: function(speed)
	{
		if(this.nextDirection !== null)
		{
			this.turn(this.nextDirection);
		}
		this.nextDirection = null;
		this.stepSpeed = speed;
		this.stepTime = speed;
		this.stepTimer = speed;
		this.stepping = true;
		if(this.holding)
		{
			this.holding.direction = this.direction;
		}
		this.requestedStep = true;
		this.world.requestStep(this, this.direction);
	}
	, destroy: function(peaceful)
	{
		if(this.i !== null)
		{
			if(this.heldBy)
			{
				this.heldBy.stopHolding();
			}

			if(this.holding)
			{
				this.stopHolding();
			}

			this.world.viewport.unBindCamera(this);

			//console.log("REMOVING", this, this.world.getObjects(this.x, this.y)[this.i]);

			this.world.removeObject(this.x, this.y, this.i);

			this.i = null;

			this.announceDeath(peaceful);
		}
	}
	, ghostColors: function()
	{
		return function(r,g,b,a,x,y)
		{
			var average = ((r+b+g)/3);
			var alpha = average > 150 ? average : 0;
			return [
				(r+average*2)/3
				, (g+average*2)/3
				, (b+average*2)/3
				, a ? alpha : 0
			];
		}
	}
	, scanGlitchColors: function(scanWidth)
	{
		return function(r,g,b,a,x,y)
		{
			var offset = Math.floor(Date.now()/1000);
			if((y+offset)%scanWidth && (r > 60 || g > 70))
			{
				return [r,g,b,a];
			}
			else
			{
				return [g,r,b,a-((r+b+g)/3)];
			}
		};
	}
	, invertColors: function()
	{
		return function(r,g,b,a)
		{
			return [
				255 - r
				, 255 - g
				, 255 - b
				, a
			];
		}
	}
	, scaleColors: function(iR,iG,iB,iA)
	{
		return function(r,g,b,a)
		{
			r *= iR;
			g *= iG;
			b *= iB;
			a *= iA;

			//return [r,g,b];
			return[
				(r>=0)?(r<256?r:255):0
				, (g>=0)?(g<256?g:255):0
				, (b>=0)?(b<256?b:255):0
				, (a>=0)?(a<256?a:255):0
			];
		}
	}
	, swapColors: function(rP,gP,bP,aP)
	{
		console.log('SWAP:', rP, gP, bP, aP);
		return function()
		{
			return [
				arguments[rP]
				, arguments[gP]
				, arguments[bP]
				, arguments[aP]
			];
		}
	}
	, alterSprite: function(pixelFunc)
	{
		var virtualCanvas	= document.createElement('canvas');
		var virtualContext	= virtualCanvas.getContext('2d');

		this.preloadSprite();

		var sprite = this.sprite;

		for(var animation in this.sprite)
		{
			for(var direction in this.sprite[animation])
			{
				for(var frame in this.sprite[animation][direction])
				{
					if(animation !== 'standard')
					{
						imageCache.loadImage(
							this.sprite[animation][direction][frame]
							, function()
							{
								virtualCanvas.width = this.width;
								virtualCanvas.height = this.height;
								virtualContext.drawImage(this, 0, 0);

								var imageData	= virtualContext.getImageData(
									0, 0
									, this.width
									, this.height
								);

								for(var i = 0; i < imageData.data.length; i += 4)
								{
									var pix = i/4;
									var newPixel = pixelFunc(
										imageData.data[i]
										, imageData.data[i+1]
										, imageData.data[i+2]
										, imageData.data[i+3]
										, (pix % this.width)
										, Math.floor(pix / this.width)
									);

									imageData.data[i] = newPixel[0];
									imageData.data[i+1] = newPixel[1];
									imageData.data[i+2] = newPixel[2];
									imageData.data[i+3] = newPixel[3];


									/*
									imageData.data[i] = 255 - imageData.data[i];
									imageData.data[i + 1] = 255 - imageData.data[i + 1];
									imageData.data[i + 2] = 255 - imageData.data[i + 2];*/
								}

								virtualContext.putImageData(imageData, 0, 0);

								console.log(animation, direction, frame);

								sprite[animation][direction][frame] = virtualCanvas.toDataURL();
							}
							, true
						);
					}
				}
			}
		}

		return this.sprite;
	}
	, collide: function(other)
	{
		//console.log('COLLIDE', this, other);
	}
	, onStep: function()
	{
	}
	, updateSprite: function()
	{
	}
	, getState: function()
	{
		var state = {};
		var stateVars = this.stateVars;

		for(var i in stateVars)
		{
			state[stateVars[i]] = this[stateVars[i]];
		}

		console.log(state);

		return state;
	}
	, jump: function(x, y, relative)
	{
		if(relative)
		{
			x += this.x;
			y += this.y;
		}

		var jumper = this.world.removeObject(
			this.x
			, this.y
			, this.i
			, true
		);

		this.world.addObject(jumper, x, y);
	}
	, announceDeath: function(peaceful)
	{
		if(this.name && !peaceful)
		{
			if(this.lastDamagedBy)
			{
				this.world.game.message.blit(
					this.name + ' destroyed by ' + this.lastDamagedBy.name + '.',
					150,
					this.deathNoteColor
				);
			}
			else
			{
				this.world.game.message.blit(
					this.name + ' destroyed.',
					150,
					this.deathNoteColor
				);
			}
		}
	}
	, crush: function(crusher)
	{
		this.crusher = crusher;
	}
});
var BindableDef = {
	useFacing: function(user)
	{
		if(this.heldBy)
		{
			this.heldBy.stopHolding();
		}

		if(user.wasHeld !== this)
		{
			user.hold(this);
		}
	}
	, push: function(pusher)
	{
		if(!this.heldBy)
		{
			this.direction = pusher.direction;
			this.step(pusher.stepSpeed);
		}

		this.collide(pusher);
		pusher.collide(this);

		this._super(pusher);

		return this.canBePushed(pusher);
	}
	, canBePushed: function(pusher)
	{
		if(this.heldBy && pusher !== this.heldBy)
		{
			return false;
		}

		var stepX   = 0;
		var stepY   = 0;

		if(pusher.direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(pusher.direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(pusher.direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(pusher.direction == this.UP)
		{
			stepY				= -1;
		}

		if(this.world.isWall(
			parseInt(this.x) + stepX
			, parseInt(this.y) + stepY)
		){
			return false;
		}

		var objects = this.world.getObjects(
			parseInt(this.x) + stepX
			, parseInt(this.y) + stepY
		);

		for(var i in objects)
		{
			if(objects[i]
				&& !objects[i].push(this)
				&& !objects[i].canBeSteppedOn(this)
			){
				return false;
			}
		}

		return true;
	}
	, update: function()
	{
		this._super();

		if(this.droppedAgo)
		{
			++this.droppedAgo;
		}
	}
	, crush: function(other)
	{
		console.log('CRUSHED!!!', this, other);
	}
};

var Bindable = Actor.extend(BindableDef);
var Character = Actor.extend({
	update: function()
	{
		this.updateSprite();
		this._super();
	}
	, updateSprite: function()
	{
		var direction = this.direction;
		var requestedStep = this.requestedStep;

		if(this.holding && this.holdDirection !== null)
		{
			direction = this.holdDirection;
		}

		if(direction > 3)
		{
			direction = direction % 4;
		}

		if(direction == 0)
		{
			this.frames = this.sprite.standing.east;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.east;
			}
		}
		else if(direction == 1)
		{
			if(!this.sprite)
			{
				console.log(this.name);
			}

			this.frames = this.sprite.standing.south;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.south;
			}
		}
		else if(direction == 2)
		{
			this.frames = this.sprite.standing.west;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.west;
			}
		}
		else if(direction == 3)
		{
			this.frames = this.sprite.standing.north;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.north;
			}
		}
	}
});
var DamageableDef = {
	init: function(sprite, maxHealth, corpse)
	{
		this._super(sprite);
		this.setHealth(maxHealth || 25);
		this.corpse				= corpse;
		this.lastDamagedBy		= null;
	}
	, setHealth: function(health)
	{
		this.maxHealth			= health;
		this.health				= health;
		this.displayHealth		= health;
		this.displayHealthBar	= 0;
	}
	, update: function()
	{
		this._super();

		if(this.displayHealth == this.health
			&& this.displayHealthBar > 0
		){
			this.displayHealthBar--;
		}

		if(this.displayHealth < this.health)
		{
			this.displayHealth += 1;
		}
		else if(this.displayHealth > this.health)
		{
			this.displayHealth -= 1;
		}

		if(this.health <= 0)
		{
			this.destroy();
		}
	}
	, render:  function(context, x, y, xPos, yPos, size)
	{
		this._super(context, x, y, xPos, yPos, size);

		if(this.health > 0
		   && this.displayHealth > 0
			&& (this.displayHealth != this.health
				|| this.displayHealthBar > 0
			)
		){
			context.strokeStyle = "#000";
			context.strokeRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size) -10
				, (size - 10)
				, 3
			);
			context.globalAlpha = 0.7;
			context.fillStyle = "#F00";
			context.fillRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size) -10
				, (size - 10)
				, 3
			);
			context.fillStyle = "#010";
			context.fillRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size)-10
				, (size - 10) * (this.displayHealth / this.maxHealth)
				, 3
			);
			context.fillStyle = "#0F0";
			context.fillRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size)-10
				, (size - 10) * (this.health / this.maxHealth)
				, 3
			);
			context.fillStyle = '#0F0';
			context.font = 'bold 13pt monospace';
			context.fillText(
				Math.floor(this.displayHealth)
				, xPos + this.getOffsetX(size) + 10
				, yPos + this.getOffsetY(size) - 20
			);
			context.strokeStyle = '#040';
			context.lineWidth = 1;
			context.strokeText(
				Math.floor(this.displayHealth)
				, xPos + this.getOffsetX(size) + 10
				, yPos + this.getOffsetY(size) - 20
			);
			context.globalAlpha = 1;
		}
	}
	, damage: function(amount, other)
	{
		this._damage(amount, other);
	}
	, _damage: function(amount, other)
	{
		if(!parseInt(localStorage.getItem('muted')))
		{	
			this.bumpNoise.play();
		}
		// this.displayHealth = this.health;
		this.health -= amount;
		this.displayHealthBar = 50;
		this.lastDamagedBy = other;

		var healthDiff = this.displayHealth - this.health;

		if(healthDiff > 100)
		{
			healthDiff = 100;
		}

		this.displayHealth = this.health + healthDiff;

		console.log(
			this.name + ' damaged by ' + amount + '/' + this.maxHealth + ' points.'
		);
	}
	, destroy: function(clean)
	{
		if(this.corpse && !clean)
		{
			this.world.addObject(
				this.corpse
				, this.x
				, this.y
			);

			if(this.corpse.damage && this.health < 0)
			{
				console.log(this.name + ' took over damage: ' + this.health);
				this.corpse.damage(-this.health)
			}
		}
		this._super(clean);
	}
	, getState: function()
	{
		this.stateVars.push('health');
		this.stateVars.push('maxHealth');
		this.stateVars.push('maxHealth');

		return this._super();
	}
};

var DamageableBindableDef = {
	push: function(pusher)
	{
		this.collide(pusher);

		pusher.collide(this);

		if(!this.heldBy && this.health > 0)
		{
			this.direction = pusher.direction;
			this.step(pusher.stepSpeed);
		}

		this.pusher = pusher;

		return this.canBePushed(pusher);
	}
};

var Damageable = Actor.extend(DamageableDef);
var DamageableBindable = Bindable.extend(DamageableDef).extend(DamageableBindableDef);
var DamageableCharacter = Character.extend(DamageableDef);
var TriggerDef = {
	init: function(sprite)
	{
		this.inverse = false;
		this._super(sprite);
		this.triggered = false;
		this.ignoreTypes = [];
		if(!this.triggers)
		{
			this.triggers = [];
		}
	}
	, reinit: function(sprite)
	{
		this._super(sprite);
		if(this.inverse)
		{
			this.triggered = true;
		}
	}
	, trigger: function()
	{
		this.triggered = true;

		if(this.inverse)
		{
			this.triggered = false;
		}
	}
	, update: function()
	{
		this._super();

		if(this.triggers.length)
		{
			var untriggered = false;

			for(var i in this.triggers)
			{
				if(this.triggers[i].triggered)
				{
					untriggered = true;
				}
			}

			if(untriggered)
			{
				triggered = false;
				this.triggered = !untriggered;

				if(this.inverse)
				{
					triggered = true;
					this.triggered = untriggered;
				}
			}
		}
	}
	, onTrigger: function(stepper)
	{

	}
};

var Trigger = Actor.extend(TriggerDef);
var Triggerable = Trigger.extend({
	init: function(sprite)
	{
		this._super(sprite);
		this.reinit();
	}
	, reinit: function(sprite)
	{
		this._super(sprite);
		if(!this.triggers)
		{
			this.triggers = [];
		}
	}
	, update: function()
	{
		this._super();

		var triggered = true;

		for(var i in this.triggers)
		{
			if(!this.triggers[i].triggered)
			{
				triggered = false;
			}
		}

		if(!this.triggers.length)
		{
			triggered = false;
		}

		if(triggered)
		{
			this.trigger();
		}
		else
		{
			this.triggered = false;

			if(this.inverse)
			{
				this.triggered = true;
			}
		}

		this.onTrigger();
	}
	, onTrigger: function()
	{

	}
});

var TriggerableAny = Triggerable.extend({
	init: function(sprite)
	{
		if(!sprite)
		{
			sprite = new TriggerSprite();
		}

		this._super(sprite);

		if(!this.name)
		{
			this.name = 'TriggerableAny';
		}
	}
	, update: function()
	{
		var triggered = false;

		for(var i in this.triggers)
		{
			if(this.triggers[i].triggered)
			{
				triggered = true;
			}
		}

		if(!this.triggers.length)
		{
			triggered = false;
		}

		this.triggered = triggered;

		if(this.inverse)
		{
			this.triggered = !triggered;
		}

		if(triggered)
		{
			this.onTrigger();
		}
	}
});

var TriggerableAllAtOnce = Triggerable.extend({
	init: function(sprite)
	{
		if(!sprite)
		{
			sprite = new TriggerSprite();
		}

		this._super(sprite);

		if(!this.name)
		{
			this.name = 'TriggerableAllAtOnce';
		}
	}
	, update: function()
	{
		this._super();

		if(!this.triggered)
		{
			for(var i in this.triggers)
			{
				this.triggers[i].triggered = false;

				if(this.inverse)
				{
					this.triggers[i].triggered = true;
				}
			}
		}
	}
});
var Projectile = Character.extend({
	init: function(sprite, damage, direction, speed)
	{
		this._super(sprite);
		this.damage = damage;
		this.direction = direction
		this.speed = speed;
	}
	, update: function()
	{
		this._super();

		var blocking = this.whyCantStep();

		if(this.canStep())
		{
			if(!this.stepping)
			{
				this.step(this.speed);
			}
		}
		else
		{
			for(var i in blocking)
			{
				if(blocking[i]) {

					if(!blocking[i].canBePushed(this))
					{
						this.collide(blocking[i]);
						blocking[i].collide(this);
					}
					else
					{
						blocking[i].push(this);
					}
				}
			}

			this.direction +=2;
			this.direction %=4;
		}
	}
	, collide: function(other)
	{
		this._super(other);
		if(other
		   && other.fireDamage
		   && other.fireDamage instanceof Function
		){
			other.fireDamage(this.damage, this)
		}
		else if(other
		   && other.damage
		   && other.damage instanceof Function
		){
			other.damage(this.damage, this);
		}
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
});
var Bullet = Projectile.extend({
	init: function(sprite, damage, direction, speed)
	{
		this._super(sprite);
		this.damage = damage;
		this.direction = direction
		this.speed = speed;
	}
	, update: function()
	{
		this._super();

		var blocking = this.whyCantStep();

		if(!this.stepping && !this.canStep())
		{
			for(var i in blocking)
			{
				if(blocking[i] && blocking[i].collide)
				{
					this.collide(blocking[i]);
					blocking[i].collide(this);
					blocking[i].push(this);
				}
			}

			this.destroy();
		}

		if(!this.stepping)
		{
			this.step(this.speed);
		}
	}
	, collide: function(other)
	{
		this._super(other);
		if(other
		   && other.fireDamage
		   && other.fireDamage instanceof Function
		){
			other.fireDamage(this.damage, this)
		}
		else if(other
		   && other.damage
		   && other.damage instanceof Function
		){
			other.damage(this.damage, this)
		}
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
});
var FloorActor = Actor.extend({
	init: function(sprite)
	{
		this._super(sprite);
		this.lastFrame = null;
		this.lastSprite = null;
		this.tileSet = false;
		this.refresh = false;
		this.persistent = false;
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		if(this.heldBy || this.stepping)
		{
			this.clearTile();
			this._super(context, x, y, xPos, yPos, size);
			return;
		}

		if(this.tileSet === false
			|| (this.frames
				&& this.frames[this.currentFrame]
				&& (this.frames[this.currentFrame] !== this.lastFrame
					|| this.sprite !== this.lastSprite
				)
			)
		){
			// this.clearTile();

			this.tileSet = this.world.addTile(
				this.x
				, this.y
				, [ this.frames[this.currentFrame] ]
				, false
				, this.tileSet ? this.tileSet.i : undefined
			);

			this.lastFrame = this.frames[this.currentFrame];
			this.lastSprite = this.sprite;
		}
	}
	, destroy: function(peaceful)
	{
		if(!this.persistent)
		{
			this.clearTile();
		}

		this._super(peaceful);
	}
	, clearTile: function()
	{
		if(this.tileSet !== false)
		{
			this.world.removeTile(
				this.tileSet.x
				, this.tileSet.y
				, this.tileSet.i
			);
			
			this.tileSet = false;
		}
	}
});

var FloorTrigger = FloorActor.extend(TriggerDef);

var StepTriggerDef = {
	update: function()
	{
		this._super();

		var coObjs = this.world.getObjects(this.x, this.y);
		for(var i in coObjs)
		{
			var skip = false;

			for(var j in this.ignoreTypes)
			{
				if(coObjs[i] instanceof this.ignoreTypes[j])
				{
					skip = true;
				}
			}

			if(coObjs[i] !== this
				//&& coObjs[i].stepTimer === 0
				&& !coObjs[i].heldBy
				&& !skip
			){
				this.triggered = true;
				this.onTrigger(coObjs[i]);

				if(this.inverse)
				{
					this.triggered = false;
				}
			}
		}
	}
	, onTrigger: function(stepper)
	{

	}
};

var StepTrigger = FloorTrigger.extend(StepTriggerDef);
var FloorBindable = StepTrigger.extend(BindableDef);

var Sprite = Class.extend({
	standard: function()
	{
		return this.standing.south;
	}
	, clone: function()
	{
		var _this = this;
		var cloner = function(obj)
		{
			var clone = {};

			if(Array.isArray(obj))
			{
				clone = [];
			}

			for (var i in obj)
			{
				if(typeof obj[i] === 'object')
				{
					clone[i] = cloner(obj[i]);
				}
				else if(typeof obj[i] === 'function')
				{
					clone[i] = obj[i].bind(clone);
				}
				else
				{
					clone[i] = obj[i];
				}
			}

			return clone;
		};

		var clone = cloner(this);

		return clone;
	}
});var Spritesheet = Class.extend({
	init: function()
	{
		this.urlPath = '/SeanMorris/ClonesNBarrels/Img/';
		
		this.imageUrl = 'free/spritesheet.png';
		this.boxesUrl = 'free/spritesheet.json';

		this.frames = {};

		this.boxes = $.ajax({
	        type: 'GET',
	        dataType: 'json',
	        url: this.urlPath + this.boxesUrl,
	        cache: false,
	        async: false
	    }).responseText;

	    this.boxes = JSON.parse	(this.boxes);

		this.image = new Image();
		this.image.src = this.urlPath + this.imageUrl;

		var _this = this;

		this.image.onload = function()
		{
			_this.processImage();			
		};

		console.log(this);
	}
	, processImage: function()
	{
		if(!this.boxes.frames)
		{
			return;
		}

		var canvas, context;

		canvas = document.createElement('canvas');
		canvas.width = this.image.width;
		canvas.height = this.image.height;

		context = canvas.getContext("2d");

		context.drawImage(this.image, 0, 0);

		//console.log(context.getImageData(0,0,this.image.width,this.image.height));

		for(var i in this.boxes.frames)
		{
			var subCanvas  = document.createElement('canvas');
			subCanvas.width = this.boxes.frames[i].frame.w;
			subCanvas.height = this.boxes.frames[i].frame.h;

			var subContext = subCanvas.getContext("2d");

			subContext.putImageData(context.getImageData(
				this.boxes.frames[i].frame.x
				, this.boxes.frames[i].frame.y
				, this.boxes.frames[i].frame.w
				, this.boxes.frames[i].frame.h
			), 0, 0);

			this.frames[this.boxes.frames[i].filename] = subCanvas.toDataURL();
		}
	}
	, getFrame: function(filename)
	{
		return this.frames[filename];
	}
});var PortalSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:portal_blue.png'
			]
			, 'east': [
				'sprite:portal_orange.png'
			]
		};
	}
});
var FireSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:fire_standing_south.png'
				, 'sprite:fire_standing_south2.png'
				, 'sprite:fire_standing_south3.png'
				, 'sprite:fire_standing_south4.png'
			]
			, 'west': [
				'sprite:fire_standing_west.png'
				, 'sprite:fire_standing_west2.png'
				, 'sprite:fire_standing_west3.png'
				, 'sprite:fire_standing_west4.png'
			]
			, 'north': [
				'sprite:fire_standing_north.png'
				, 'sprite:fire_standing_north2.png'
				, 'sprite:fire_standing_north3.png'
				, 'sprite:fire_standing_north4.png'
			]
			, 'east': [
				'sprite:fire_standing_east.png'
				, 'sprite:fire_standing_east2.png'
				, 'sprite:fire_standing_east3.png'
				, 'sprite:fire_standing_east4.png'
			]
		};

		this.walking = this.standing;

		this.standard = function()
		{
			return this.standing.west;
		}
	}
});
var ButtonSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:button.png'
			]
		};
	}
});
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
var BoxSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:box.png'
			]
		};
	}
});
var LavaSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:lava_center_middle.png'
			]
			, 'top': [
				'sprite:lava_top_middle.png'
			]
			, 'bottom': [
				'sprite:lava_bottom_middle.png'
			]
			, 'left': [
				'sprite:lava_center_left.png'
			]
			, 'right': [
				'sprite:lava_center_right.png'
			]
			, 'topLeft': [
				'sprite:lava_top_left.png'
			]
			, 'bottomLeft': [
				'sprite:lava_bottom_left.png'
			]
			, 'topRight': [
				'sprite:lava_top_right.png'
			]
			, 'bottomRight': [
				'sprite:lava_bottom_right.png'
			]
		};

		this.cold = {
			'south': [
				'sprite:lava_cold_center_middle.png'
			]
			, 'top': [
				'sprite:lava_cold_top_middle.png'
			]
			, 'bottom': [
				'sprite:lava_cold_bottom_middle.png'
			]
			, 'left': [
				'sprite:lava_cold_center_left.png'
			]
			, 'right': [
				'sprite:lava_cold_center_right.png'
			]
			, 'topLeft': [
				'sprite:lava_cold_top_left.png'
			]
			, 'bottomLeft': [
				'sprite:lava_cold_bottom_left.png'
			]
			, 'topRight': [
				'sprite:lava_cold_top_right.png'
			]
			, 'bottomRight': [
				'sprite:lava_cold_bottom_right.png'
			]
		};
	}
});
var ComputerSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:computer_top.png'
			]
			, 'south_bottom': [
				'sprite:computer_bottom.png'
			]
		};

		this.warm = {
			'south': [
				'sprite:computer_top.png'
				, 'sprite:computer_top.png'
				, 'sprite:computer_top.png'
				, 'sprite:computer_top_warm.png'
				, 'sprite:computer_top_warm.png'
			]
			, 'south_bottom': [
				'sprite:computer_bottom.png'
			]
		};
	}
});
var SandbagSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:sandbag.png'
			]
		};
	}
});
var LaserBeamSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:laser_vert.png'
			]
			, 'west': [
				'sprite:laser.png'
			]
			, 'north': [
				'sprite:laser_vert.png'
			]
			, 'east': [
				'sprite:laser.png'
			]
		};

		this.standard = function()
		{
			return this.standing.west;
		}
	}
});
var NullSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:null.png'
			]
		};
	}
});
var TriggerSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:trigger.png'
			]
		};
	}
});
var PlayerCorpseSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:player_corpse.png'
			]
		};
	}
});
var IceBlockSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:ice.png'
			]
		};
	}
});
var PlayerSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'north': [
				'sprite:player_standing_north.png'
			]
			, 'south': [
				'sprite:player_standing_south.png'
			]
			, 'west': [
				'sprite:player_standing_west.png'
			]
			, 'east': [
				'sprite:player_standing_east.png'
			]
		};

		this.walking = {
			'north': [
				'sprite:player_walking_north.png'
				, 'sprite:player_walking_north.png'
				, 'sprite:player_standing_north.png'
				, 'sprite:player_walking_north2.png'
				, 'sprite:player_walking_north2.png'
				, 'sprite:player_standing_north.png'
			]
			, 'south': [
				'sprite:player_walking_south.png'
				, 'sprite:player_walking_south.png'
				, 'sprite:player_standing_south.png'
				, 'sprite:player_walking_south2.png'
				, 'sprite:player_walking_south2.png'
				, 'sprite:player_standing_south.png'

			]
			, 'west': [
				'sprite:player_walking_west.png'
				, 'sprite:player_walking_west.png'
				, 'sprite:player_standing_west.png'
				, 'sprite:player_walking_west2.png'
				, 'sprite:player_walking_west2.png'
				, 'sprite:player_standing_west.png'
			]
			, 'east': [
				'sprite:player_walking_east.png'
				, 'sprite:player_walking_east.png'
				, 'sprite:player_standing_east.png'
				, 'sprite:player_walking_east2.png'
				, 'sprite:player_walking_east2.png'
				, 'sprite:player_standing_east.png'
			]
		};
	}
});
var BloodStainSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:blood_stain.png'
			]
		};
	}
});
var WoodBoxSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:wood_box.png'
			]
		};
	}
});
var BlastMarkSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:blast_mark.png'
			]
		};
	}
});
var ButtonActivatedSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:button_activated.png'
			]
		};
	}
});
var BarrierSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:barrier_bottom_center.png'
			]
			, 'west': [
				'sprite:barrier_middle_left.png'
			]
			, 'north': [
				'sprite:barrier_top_center.png'
			]
			, 'east': [
				'sprite:barrier_middle_right.png'
			]
		};
	}
});
var PitSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:pit.png'
			]
		};
	}
});
var AngleSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:angle_south.png'
			]
			, 'west': [
				'sprite:angle_west.png'
			]
			, 'north': [
				'sprite:angle_north.png'
			]
			, 'east': [
				'sprite:angle_east.png'
			]
		};

		this.standard = function()
		{
			return this.standing.north;
		}
	}
});
var CheeseSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:cheese.png'
			]
		};
	}
});
var BarrelHoleSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:barrel_hole.png'
			]
		};

		this.open = {
			'south': [
				'sprite:barrel_hole_open.png'
			]
		};

		this.opening = {
			'south': [
				'sprite:barrel_hole_opening.png'
				, 'sprite:barrel_hole_opening_2.png'
				, 'sprite:barrel_hole_opening_3.png'
			]
		};

		this.closing = {
			'south': [
				 'sprite:barrel_hole_opening_4.png'
				, 'sprite:barrel_hole_opening_3.png'
				, 'sprite:barrel_hole_opening_2.png'
				, 'sprite:barrel_hole_opening.png'
			]
		};

		this.sealing = {
			'south': [
				'sprite:barrel_hole.png'
				, 'sprite:barrel_hole_sealing.png'
				, 'sprite:barrel_hole_sealing_2.png'
				, 'sprite:barrel_hole_sealing_3.png'
				, 'sprite:barrel_hole.png'
				, 'sprite:barrel_hole_sealing.png'
				, 'sprite:barrel_hole_sealing_2.png'
				, 'sprite:barrel_hole_sealing_3.png'
				, 'sprite:barrel_hole.png'
				, 'sprite:barrel_hole_sealing.png'
				, 'sprite:barrel_hole_sealing_2.png'
				, 'sprite:barrel_hole_sealing_3.png'
				, 'sprite:barrel_hole.png'
				, 'sprite:barrel_hole_sealing.png'
				, 'sprite:barrel_hole_sealing_2.png'
			]
		}

		this.sealed = {
			south: [
				'sprite:barrel_hole_sealing_2.png'
			]
		}
	}
});
var DoorSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:door_closed.png'
			]
		};

		this.open = {
			'south': [
				'sprite:door_opened.png'
			]
		};
	}
});
var BubbleSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:bubble.png'
			]
		};
	}
});
var WarpSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:warp.png'
			]
		};
	}
});
var BoxesSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:boxes.png'
			]
		};
	}
});
var RockSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:rock_tall_1.png'
			]
		};
	}
});
var HealthSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:health.png'
			]
		};
	}
});
var SentinelSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'north': [
				'sprite:sentinel_standing_north.png'
			]
			, 'south': [
				'sprite:sentinel_standing_south.png'
			]
			, 'west': [
				'sprite:sentinel_standing_west.png'
			]
			, 'east': [
				'sprite:sentinel_standing_east.png'
			]
		};

		this.walking = {
			'north': [
				'sprite:sentinel_standing_north.png'
				, 'sprite:sentinel_walking_north.png'
				, 'sprite:sentinel_standing_north.png'
				, 'sprite:sentinel_walking_north_2.png'
			]
			, 'south': [
				'sprite:sentinel_standing_south.png'
				, 'sprite:sentinel_walking_south.png'
				, 'sprite:sentinel_walking_south.png'
				, 'sprite:sentinel_standing_south.png'
				, 'sprite:sentinel_walking_south_2.png'
				, 'sprite:sentinel_walking_south_2.png'

			]
			, 'west': [
				'sprite:sentinel_standing_west.png'
				, 'sprite:sentinel_walking_west.png'
				, 'sprite:sentinel_standing_west.png'
				, 'sprite:sentinel_walking_west_2.png'
			]
			, 'east': [
				'sprite:sentinel_standing_east.png'
				, 'sprite:sentinel_walking_east.png'
				, 'sprite:sentinel_standing_east.png'
				, 'sprite:sentinel_walking_east_2.png'
			]
		};
	}
});
var SentinelCorpseSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:sentinel_dead.png'
			]
		};
	}
});
/*
function ComputerSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/computer_top.png'
		]
		, 'south_bottom': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/computer_bottom.png'
		]
	};

	this.warm = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/computer_top.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/computer_top.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/computer_top.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/computer_top_warm.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/computer_top_warm.png'
		]
		, 'south_bottom': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/computer_bottom.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
*/// /home/sean/newninja/vendor/seanmorris/clonesnbarrels/asset/Js/Sprites/Pokemon/ItemSprite.js
/*
function ItemSprite()
{
	this.standing = {south: ['/SeanMorris/ClonesNBarrels/Img/pokemon/item.png']};

	this.standard = function()
	{
		return this.standing.south;
	}
}
*/// /home/sean/newninja/vendor/seanmorris/clonesnbarrels/asset/Js/Sprites/Pokemon/SignPostSprite.js
/*
function SignPostSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/sign_post.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
*/// /home/sean/newninja/vendor/seanmorris/clonesnbarrels/asset/Js/Sprites/Pokemon/DudeSprite.js
/*
function DudeSprite()
{
	this.standing = {
		'north': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_north.png'
		]
		, 'south': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_south.png'
		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_west.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_east.png'
		]
	};

	this.walking = {
		'north': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_2_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_2_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_2_north.png'
		]
		, 'south': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_2_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_2_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_2_south.png'

		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_west.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_west.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_west.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_east.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_walking_east.png'
			, '/SeanMorris/ClonesNBarrels/Img/pokemon/gary_standing_east.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
*/// /home/sean/newninja/vendor/seanmorris/clonesnbarrels/asset/Js/Objects/OmniPit.js
var Bgm = Class.extend({
	init: function(game)
	{
		this.game = game;
		this.playlist = [
			'/SeanMorris/ClonesNBarrels/Sound/533768_Bytestep.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/645536_-Pixelated-.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/621144_TheFatRat---Infinite-Power.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/613426_Destractor.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/649164_Cybernetic-Lifeform.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/530471_Coins-8Bit.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/631905_Somuchfun.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/642215_Return-to-Warp.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/514068_N3Z-3---8-bit-crush.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/651983_Motions.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/648035_Milky-Ways-Redux.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/557827_Retro-Hearts-8th-Sense-Rem.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/632595_Astronomixel.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/658572_Gods-of-Chipstep.mp3'
		];

		this.playlistMeta = [
			'Bytestep by conorstrejcek'
			, '-Pixelated- by Spitfire5570'
			, 'Infinite Power by TheFatRat'
			, 'Destractor by neocrey'
			, 'Cybernetic Lifeform by MaliciousWyvern'
			//, '530471_Coins-8Bit'
			//, '631905_Somuchfun'
			, 'Return To Warp by CherryBerryGangsta'
			, '8-Bit Crush by NZ3'
			, 'Motions by midimachine'
			, 'Milky Ways Redux by Holyyeah'
			, 'Retro Hearts (8th Sense Remix) by Skullbeatz'
			//, '632595_Astronomixel'
			, 'Gods of Chipstep by wandschrank and AliceMako'
		];

		this.playheader = localStorage.getItem('playHeader') || -1;

		this.playheader = parseInt(this.playheader);

		this.playheader++;

		if(this.playheader >= this.playlist.length)
		{
			this.playheader = 0;
		}

		localStorage.setItem('playHeader', this.playheader);

		this.audio = null;
	}
	, play: function(antiToggle)
	{
		if(this.audio)
		{
			if(this.audio.paused && (antiToggle === undefined || antiToggle == true))
			{
				this.game.message.blit('Playing ' + this.playlistMeta[this.playheader]);

				this.audio.play();
			}
			else if(!antiToggle)
			{
				this.audio.pause();
			}
		}
		else
		{
			this.game.message.blit('Playing ' + this.playlistMeta[this.playheader], 500);

			this.audio = new Audio(this.playlist[this.playheader]);
			this.audio.play();
			var _this = this;
			this.audio.onended = function() {
				_this.next();
			};
		}

		console.log(this.playlist[this.playheader]);
	}
	, next: function()
	{
		++this.playheader;

		if(this.playheader >= this.playlist.length)
		{
			this.playheader = 0;
		}

		localStorage.setItem('playHeader', this.playheader);

		if(this.audio)
		{
			this.audio.pause();

			delete this.audio;
		}

		this.audio = new Audio(this.playlist[this.playheader]);

		this.play();

		var _this = this;
		this.audio.onended = function() {
			_this.next();
		};
	}
	, previous: function()
	{
		this.playheader--;

		if(this.playheader < 0)
		{
			this.playheader = this.playlist.length - 1;
		}

		localStorage.setItem('playHeader', this.playheader);

		if(this.audio)
		{
			this.audio.pause();

			delete this.audio;
		}

		this.audio = new Audio(this.playlist[this.playheader]);

		this.play();

		var _this = this;
		this.audio.onended = function() {
			_this.next();
		};
	}
});function MenuState(game)
{
	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.menu		= new MainMenu(game);

	this.onEnter = function(params)
	{
		if(params && params.menu)
		{
			this.menu = params.menu;
		}

		this.menu.flushBg();
	}

	this._update = this.update;
	this.update = function()
	{
		this.menu.update();
		this.menu.render();
		this._update();
	}

	this.onExit = function()
	{

	}
}
function TitleState(game)
{
	var state = new State();
	var used = false;

	for(var i in state)
	{
		this[i]		= state[i];
	}

	var autoForward;
	var setAutoForward = function()
	{
		clearTimeout(autoForward);
		autoForward = setTimeout(
			function()
			{
				if(used)
				{
					return;
				}
				game.stackState(
					'menu'
					, {menu: new MainMenu(game)}
					, true
				);
			}
			, 3750
		);
	}

	this.onEnter = function(params)
	{
		var muted = parseInt(localStorage.getItem('muted'));

		var used = false;

		muted || game.bgm.play();
		this.titleScreen = new TitleScreen(game);

		//setAutoForward();
	}

	this.onRestore = function()
	{
		//setAutoForward();
	}

	this.update = function()
	{
		this.titleScreen.render();

		if((game.clickVectors[0]
			&& game.clickVectors[0].released)
			|| game.keyStates[32] === 0
		){
			used = true;
			game.stackState(
				'menu'
				, {menu: new MainMenu(game)}
				, true
			);
		}
	}

	this.onExit = function()
	{
		clearTimeout(autoForward);
		//this.titleBGM.pause();
	}
}
function ClickVector(mouseState, deadZone)
{
	this.startX 	= mouseState[0];
	this.endX		= mouseState[0];
	this.startY		= mouseState[1];
	this.endY		= mouseState[1];

	window.mouseX = mouseState[0];
	window.mouseY = mouseState[1];

	this.deadZone	= deadZone || 20;
	this.age		= 0;

	this.x			= 0;
	this.y			= 0;

	this.magnitude	= null;
	this.theta		= null;

	this.RIGHT	= 0;
	this.DOWN	= 1;
	this.LEFT	= 2;
	this.UP		= 3;

	this.EAST	= this.RIGHT;
	this.SOUTH	= this.DOWN;
	this.WEST	= this.LEFT;
	this.NORTH	= this.UP;

	this.size	= 60;
	this.inidcatorSize = this.size;
	this.margin = this.inidcatorSize*1.6;

	this.alpha = 0.4;

	this.released = false;

	this.undragged = true;

	this.release = function()
	{
		this.released = true;
	}

	this.active		= function()
	{
		return !this.released
			&& this.magnitude > this.deadZone;
	}

	this.cardinal	= function()
	{
		if(
			Math.abs(this.y) > Math.abs(this.x)
			&& this.y > 0
		){
			return this.UP;
		}

		if(
			Math.abs(this.y) < Math.abs(this.x)
			&& this.x < 0
		){
			return this.RIGHT;
		}

		if(
			Math.abs(this.y) > Math.abs(this.x)
			&& this.y < 0
		){
			return this.DOWN;
		}

		if(
			Math.abs(this.y) < Math.abs(this.x)
			&& this.x > 0
		){
			return this.LEFT;
		}

		return 0;
	}

	this.update		= function(newMouseState)
	{
		this.endX	= window.mouseX;
		this.endY	= window.mouseY;

		this.x		= this.startX - this.endX;
		this.y		= this.startY - this.endY;

		this.magnitude = Math.sqrt(
			(this.x * this.x) + (this.y * this.y)
		);

		if(this.magnitude > this.deadZone)
		{
			this.undragged = false;
		}

		this.theta	= this.x ? Math.atan(this.y/this.x) : 1.5*Math.PI;

		if(this.x > 0)
		{
			this.theta += Math.PI;
		}

		this.age++;
	}

	this.render		= function(context)
	{
		context.lineWidth = 3;

		context.globalAlpha = this.alpha;

		context.beginPath();
		context.strokeStyle = "#FFF";
		context.arc(
			this.startX - $(context.canvas).offset().left
			, this.startY - $(context.canvas).offset().top
			, this.size
			, 0
			, 2*Math.PI
		);

		context.fillStyle = '#CA0';

		if(!this.active())
		{
			context.fillStyle = '#C55';
			context.fill();
		}
		else
		{
			context.beginPath();
/*			
			context.moveTo(
				this.endX - $(context.canvas).offset().left
				, this.endY - $(context.canvas).offset().top
			);
			context.lineTo(
				(this.startX - $(context.canvas).offset().left)
					+ Math.cos(this.theta) * this.margin
				, (this.startY - $(context.canvas).offset().top)
					+ Math.sin(this.theta) * this.margin
			);
			context.lineWidth = 7;
			context.strokeStyle = '#333';
			context.stroke();
			context.lineWidth = 3;
			context.strokeStyle = '#CA0';
			context.stroke();
 /*/
 //*/			
 			this.renderQuads(context);
		}

		context.globalAlpha = 1;

		context.strokeStyle = '#333';

		context.beginPath();

		context.arc(
			this.startX - $(context.canvas).offset().left
			, this.startY - $(context.canvas).offset().top
			, this.deadZone
			, 0
			, 2*Math.PI
		);

		context.stroke();
	}

	this.renderQuads = function(context)
	{
		for(var i in [0,1,2,3])
		{
			context.beginPath();

			context.moveTo(
				this.startX - $(context.canvas).offset().left
				, this.startY - $(context.canvas).offset().top
			);

			context.arc(
				this.startX - $(context.canvas).offset().left
				, this.startY - $(context.canvas).offset().top
				, i == this.cardinal() ?
					this.inidcatorSize
					: this.deadZone
				, (i ? ((i*0.5)-0.25) : 0.25) * Math.PI
				, (i ? ((i*0.5)+0.25) : 0.75) * Math.PI
			);

			context.lineTo(
				this.startX - $(context.canvas).offset().left
				, this.startY - $(context.canvas).offset().top
			);

			if(i == this.cardinal())
			{
				context.fillStyle = '#C55';
			}
			else
			{
				context.fillStyle = '#CA0';
			}

			context.fill();
		}
	}
}
function DialogMenuState(game)
{
	this.game		= game;

	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.onEnter	= function(params)
	{
		this.dialogMenu = new DialogMenu();

		if(params && params.text)
		{
			this.dialogMenu.dialog = new Dialog(game, params.text);
		}

		if(params && params.menu)
		{
			this.dialogMenu.menu = params.menu;
		}

		console.log(this.dialogMenu.menu.topMargin);
	}

	this._update = this.update;
	this.update = function()
	{
		this.dialogMenu.update({
			'keyStates'		: game.keyStates.slice(0)
			, 'mouseStates'	: game.mouseStates.slice(0)
			, 'scrollStates': game.scrollStates.slice(0)
			, 'clickVectors': game.clickVectors.slice(0)
		});
		this.dialogMenu.render();
		this._update();
	}

	this.onExit = function()
	{

	}
}
function State()
{
	this.age = 0;
	this.update = function()
	{
		this.age++;
	}
}
var TitleScreen = function(game)
{
	this.titleImg = imageCache.loadImage('/SeanMorris/ClonesNBarrels/Img/titleScreen.png');

	this.render = function()
	{
		var width   = game.context.canvas.width;
		var height  = game.context.canvas.height;

		var context = game.context;
		var center	= [width/2,height/2];

		context.fillStyle = '#000';
		context.fillRect(
			0, 0, width, height
		);
		if(this.titleImg.complete)
		{
			game.context.drawImage(
				this.titleImg
				, center[0] - this.titleImg.width/2
				, center[1] - this.titleImg.height/2
			);
		}
	}
}
function MainState(game)
{
	this.player;
	this.world;

	this.inst = ++MainState.instanceCount;
	this.mapStorable = null;

	var vXSize;
	var vYSize;

	//*
	//1767 tiles
	vXSize	= 57;
	vYSize	= 31;
	/*/
	//1025 tiles
	var vXSize	= 41;
	var vYSize	= 25;
	//*/
	//*/
	//*/
	vXSize	= 25;
	vYSize	= 19;
	//*/

	vXSize	= 36;
	vYSize	= 24;

	var tileSize = 32;
	var _this = this;

	this.viewport	= new Viewport(game, vXSize, vYSize, tileSize);
	this.viewport.resize();
	$(window).on('resize', function(){ _this.viewport.resize() });

	this.onEnter = function()
	{
		console.log('enter');
		this.viewport	= new Viewport(game, vXSize, vYSize, tileSize);
		this.world		= new World();

		this.viewport.bindWorld(this.world);
		this.world.bindGameObject(game);

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
			console.log(loadMap);
			loadMap.load(splitPathname[2]);

			this.mapStorable = loadMap;

			console.log(loadMap);

			this.world.map.setData(loadMap.mapdata);
			this.world.mapSet.addMap(loadMap);
			this.world.mapSet.switchMap(loadMap.publicId);
		}
		else
		{
			this.world.mapSet.switchMap(
				this.world.mapSet.startingMap
				, undefined
				, undefined
				, undefined
				, true
			);
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
				, 'buttons'		: game.padStates
				, 'axes'		: game.padAxes
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
var Message = Class.extend({
	init: function(game)
	{
		this.game = game;
		this.messages = [];
		this.frame = 0;
	}
	, blit: function(string, displayFrames, color)
	{
		if(!displayFrames)
		{
			displayFrames = 150;
		}

		color = color || '55,55,55';

		if(color == 'good')
		{
			color = '55,105,0';
		}

		if(color == 'better')
		{
			color = '75,105,0';
		}

		if(color == 'warning')
		{
			color = '150,120,0';
		}

		if(color == 'damage')
		{
			color = '180,80,0';
		}

		this.messages.push({
			string:string
			, displayFrames:displayFrames
			, frame:0
			, color
		});
	}
	, update: function()
	{
		var width   = this.game.context.canvas.width;
		var height  = this.game.context.canvas.height;
		var wRadius = width/2;
		var hRadius = height/2;

		var context = this.game.context;
		var center	= [wRadius,hRadius];

		context.font = '22pt arial';
		
		var spacing = 40;

		for(var i in this.messages)
		{
			this.messages[i].frame++;

			var messageWidth = context.measureText(this.messages[i].string);

			var alpha = Math.round(
				((this.messages[i].displayFrames - this.messages[i].frame) / this.messages[i].displayFrames) * 100
			) / 100;

			context.fillStyle = 'rgba('+this.messages[i].color+',' + alpha + ')';
			context.fillRect(
				center[0] - wRadius + spacing - 5
				, center[1] + hRadius + (spacing * ( i - this.messages.length ) ) - spacing + 10
				, messageWidth.width + 10
				, spacing
			);

			context.strokeStyle = 'rgba(0,0,0,' + alpha + ')';
			context.strokeText(
				this.messages[i].string
				, center[0] - wRadius + spacing
				, center[1] + hRadius + (spacing * ( i - this.messages.length ) )
			);

			context.fillStyle = 'rgba(255,255,255,' + alpha + ')';
			context.fillText(
				this.messages[i].string
				, center[0] - wRadius + spacing
				, center[1] + hRadius + (spacing * ( i - this.messages.length ) )
			);
		}

		for(var i in this.messages)
		{
			if(this.messages[i].displayFrames <= this.messages[i].frame)
			{
				this.messages.splice(i, 1);
			}
		}

		this.frame++;
	}
});var Editor = Class.extend({
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
function DialogState(game)
{
	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}
	
	this.dialog		= new Dialog(game);

	this.onEnter	= function(params)
	{
		if(params && params.text)
		{
			this.dialog = new Dialog(game, params.text);
		}
	}

	this._update = this.update;
	this.update = function()
	{
		this.dialog.update({
			'keyStates'		: game.keyStates.slice(0)
			, 'mouseStates'	: game.mouseStates.slice(0)
			, 'scrollStates': game.scrollStates.slice(0)
			, 'clickVectors': game.clickVectors.slice(0)
		});
		this.dialog.render();
		this._update();
	}

	this.onExit = function()
	{

	}
}
var Storable = Class.extend({
	init: function()
	{
		this.id = null;
		this.publicId = null;
		this.title = null;
		this.created = null;
		this.updated = null;
		this.messages = [];
	}
	, save: function()
	{
		var data = {};

		for(var i in this)
		{
			if(i.match(/^_/) || (this[i] instanceof Function))
			{
				continue;
			}

			data[i] = this[i];
		}

		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '/edit?api';

		if(!this.publicId)
		{
			var endpoint = this._endpoint + '/create?api';
		}

		var _this = this;
		var success = false;

		$.ajax({
			url: endpoint
			, method: 'POST'
			, data: data
			, dataType: 'JSON'
			, async: false
			, success: function(data)
			{
				if(typeof data.body == 'undefined' || !data.body)
				{
					_this.messages = data.messages;
					return;
				}

				for(var i in _this)
				{
					if(!i.match(/^_/)
						&& data.body[i] !== undefined
						&& !(_this[i] instanceof Function)
					){
						_this[i] = data.body[i];
					}
				}

				success = true;
			}
		});

		return success;
	}
	, load: function(id)
	{
		if(id)
		{
			this.publicId = id;
		}

		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '?api';

		var _this = this;

		var data = JSON.parse($.ajax({
			url: endpoint
			, dataType: 'json'
			, async: false
		}).responseText);

		for(var i in this)
		{
			if(!i.match(/^_/)
				&& data.body[i] !== undefined
				&& !(this[i] instanceof Function)
			){
				this[i] = data.body[i];
			}
		}
	},
	getMessages: function()
	{
		var m = this.messages;
		this.messages = [];
		return m;
	}
});
var SaveState = Storable.extend({
	init: function()
	{
		this.title = null;
		this.savedata = null;
		this._endpoint = '/saveState';
		this._key = 'ClonesNBarrelsSaveStateId';
	}
	, save: function(world)
	{
		if(world.saveStateId)
		{
			this.publicId = world.saveStateId;
			this.title = world.saveStateTitle;
		}

		this.savedata = JSON.stringify(world.getState());

		if(!this.title)
		{
			this.title = 'Save #' + Date.now();
		}

		var result = this._super();

		world.saveStateId    = this.publicId;
		world.saveStateTitle = this.title;

		return result;
	}
	, load: function(world)
	{
		if(world.saveStateId)
		{
			this._super(world.saveStateId);
		}
		else
		{
			this._super();
		}

		this.savedata = JSON.parse(this.savedata);

		world.setState(this.savedata);

		for(var map in this.savedata.state)
		{
			//world.mapSet.loadState(map);
		}

		world.mapSet.switchMap(
			this.savedata.playerState.map
			, this.savedata.playerState.x
			, this.savedata.playerState.y
		);

		if(this.savedata.partyState)
		{
			for(var i in this.savedata.partyState)
			{
				var clone = new PlayerClone();

				world.addObject(
					clone
					, this.savedata.partyState[i].x
					, this.savedata.partyState[i].y
				);

				world.viewport.actor.addParty(clone);
			}
		}

		world.saveStateId = this.publicId;
		world.saveStateTitle = this.title;
	}
	/*
	, update: function(world, ignore, id)
	{
		this._super(world, ignore, id);

		if(ignore)
		{
			return;
		}

		var savedata = JSON.parse(data.savedata);

		world.mapSet.mapStates = savedata.state;
		world.mapSet.playerState = savedata.playerState;

		world.mapSet.switchMap(
			savedata.playerState.map
			, savedata.playerState.x
			, savedata.playerState.y
		);
	}
	*/
});
var MapStorable = Storable.extend({
	init: function()
	{
		this.mapdata = null;
		
		this._endpoint = '/map';
	}
});var SaveState = Storable.extend({
	init: function()
	{
		this.title = null;
		this.savedata = null;
		this._endpoint = '/saveState';
		this._key = 'ClonesNBarrelsSaveStateId';
	}
	, save: function(world)
	{
		if(world.saveStateId)
		{
			this.publicId = world.saveStateId;
			this.title = world.saveStateTitle;
		}

		this.savedata = JSON.stringify(world.getState());

		if(!this.title)
		{
			this.title = 'Save #' + Date.now();
		}

		var result = this._super();

		world.saveStateId    = this.publicId;
		world.saveStateTitle = this.title;

		return result;
	}
	, load: function(world)
	{
		if(world.saveStateId)
		{
			this._super(world.saveStateId);
		}
		else
		{
			this._super();
		}

		this.savedata = JSON.parse(this.savedata);

		world.setState(this.savedata);

		for(var map in this.savedata.state)
		{
			//world.mapSet.loadState(map);
		}

		world.mapSet.switchMap(
			this.savedata.playerState.map
			, this.savedata.playerState.x
			, this.savedata.playerState.y
		);

		if(this.savedata.partyState)
		{
			for(var i in this.savedata.partyState)
			{
				var clone = new PlayerClone();

				world.addObject(
					clone
					, this.savedata.partyState[i].x
					, this.savedata.partyState[i].y
				);

				world.viewport.actor.addParty(clone);
			}
		}

		world.saveStateId = this.publicId;
		world.saveStateTitle = this.title;
	}
	/*
	, update: function(world, ignore, id)
	{
		this._super(world, ignore, id);

		if(ignore)
		{
			return;
		}

		var savedata = JSON.parse(data.savedata);

		world.mapSet.mapStates = savedata.state;
		world.mapSet.playerState = savedata.playerState;

		world.mapSet.switchMap(
			savedata.playerState.map
			, savedata.playerState.x
			, savedata.playerState.y
		);
	}
	*/
});
function Game(canvas)
{
	this.canvas		= canvas;
	this.context	= canvas[0].getContext('2d');
	this.debug		= {};

	this.deadZone	= 0.25;

	this.keyStates	= [];
	this.padStates	= [];
	this.padAxes	= [];
	this.mouseStates= [];
	this.scrollStates=[];
	this.clickVectors=[];

	this.clickVector = null;

	this.lastMouseStates = [];
	this.lastKeyStates	 = [];
	this.lastPadStates	 = [];

	this.states		= {
		init:		TitleState
		, main:		MainState
		, menu:		MenuState
		, dialog:	DialogState
		, dialogMenu: DialogMenuState
	};

	this.prevState	= null;

	this.stateStack = [];

	this.dev = false;

	this.editor = new Editor(this);
	this.message = new Message(this);
	this.bgm = new Bgm(this);

	this.nextUp = [];
	this.nextFocus = [];

	var focused = true;

	var _this = this;

	window.onfocus = function() {
		focused = true;
		_this.doNextFocusAction();
	};
	window.onblur = function() {
		focused = false;
	};

	this.onNextUp = function(action)
	{
		this.nextUp.push(action);
	}

	this.doNextUpAction = function()
	{
		if(this.nextUp.length)
		{
			this.clickVectors = [];
			this.KeyStates = [];
		}
		while(next = this.nextUp.shift())
		{
			next();
		}
	}

	this.onNextFocus = function(action)
	{
		console.log(this.nextFocus)
		this.nextFocus.push(action);
	}

	this.doNextFocusAction = function()
	{
		while(next = this.nextFocus.shift())
		{
			next();
		}
	}

	this.restoreState = function()
	{
		if(this.stateStack.length)
		{
			this.currentState = this.stateStack.pop();
			if(this.currentState.onRestore)
			{
				this.currentState.onRestore();
			}
			return true;
		}

		return false;
	}

	this.stackState = function(state, params)
	{
		this.stateStack.push(this.currentState);

		this.changeState(state, params);

		return true;
	}

	this.flushStates = function()
	{
		if(this.stateStack.length)
		{
			this.currentState = this.stateStack.pop();
			//return true;
		}
		this.stateStack = [];
	}

	this.changeState = function(state, params, forceNew)
	{
		if(forceNew)
		{
			while(this.stateStack.length)
			{
				this.stateStack.pop().onExit();
			}

			this.currentState.onExit();

			this.currentState = undefined;
		}

		this.currentState = new this.states[state](this);
		this.currentState.onEnter(params);
	}

	//*/
	this.currentState = new MainState(this);
	/*/
		this.currentState = this.states.main;
	//*/

	this.stackState('init');

	//Move this?
	// requestAnim shim layer by Paul Irish
	window.requestAnimFrame = (function(){
		return window.requestAnimationFrame  ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame  ||
		window.msRequestAnimationFrame  ||
		function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 30);
		};
	})();
	var fps = 0;
	var now;
	var lastUpdate = (new Date)*1 - 1;
	var fpsFilter = 10;

	var gameLoopFunc = (function(game)
	{
		return function()
		{
			setTimeout(
				function()
				{
					var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
					fps += (thisFrameFPS - fps) / fpsFilter;
					lastUpdate = now;
					//console.log('Setup next frame...');
					//*/
					requestAnimFrame(gameLoopFunc);
					/*/
					setTimeout(gameLoopFunc, 15);
					//*/

					if(!focused)
					{
						//return;
					}

					//console.log('Start taking input');

					for(var i in game.keyStates)
					{
						if(
						   game.keyStates[i] === 0
						   && game.keyStates[i] === game.lastKeyStates[i]
						){
							delete game.keyStates[i];
							delete game.lastKeyStates[i];
						}
						else if(i in game.keyStates)
						{
							game.lastKeyStates[i] = game.keyStates[i];
						}

						if(i in game.keyStates && game.keyStates[i])
						{
							game.keyStates[i]++;
						}
					}

					for(var i in game.mouseStates)
					{
						if(
							game.mouseStates[i]
							&& game.lastMouseStates[i]
							&& game.mouseStates[i].length == 3
							&& game.lastMouseStates[i].length == 3
							&& game.mouseStates[i][2] === 0
							&& game.mouseStates[i][2] === game.lastMouseStates[i][2]
						){
							delete game.mouseStates[i];
							delete game.lastMouseStates[i];
						}
						else if(
							game.mouseStates[i]
							&& game.mouseStates[i].length == 3
						){
							game.lastMouseStates[i] = game.mouseStates[i];
						}

						if(
							game.mouseStates[i]
							&& game.mouseStates[i].length == 3
							&& game.mouseStates[i][2]
						){
							game.mouseStates[i][2]++;
						}

						if(game.clickVectors[i] && game.clickVectors[i].released)
						{
							delete game.clickVectors[i];
						}

						if(game.mouseStates[i] && game.mouseStates[i][2])
						{
							if(game.clickVectors[i])
							{
								game.clickVectors[i].update(game.mouseStates[i]);
							}
							else
							{
								var deadZone = undefined;

								if(game.dev)
								{
									deadZone = 3;
								}

								game.clickVectors[i] = new ClickVector(game.mouseStates[i], deadZone);
							}
						}
						else if(game.clickVectors[i])
						{
							game.clickVectors[i].release();
						}
					}

					if(
						game.keyStates[27] === 0
						|| game.keyStates[81] === 0
						||  game.padStates[7] === 0
						|| ( game.mouseStates[2]
							&&  game.mouseStates[2][2] === 0
						)
					){
						if(game.currentState instanceof game.states.menu)
						{
							game.restoreState();
						}
						else if(game.currentState instanceof game.states.main)
						{
							game.stackState(
								'menu'
								, {menu: new PauseMenu(game)}
								, true
							);
						}
						else
						{
							game.stackState(
								'menu'
								, {menu: new MainMenu(game)}
								, true
							);
						}
					}

					if(game.keyStates[192] === 0)
					{
						game.dev = !game.dev;
					}

					if('getGamepads' in navigator)
					{
						var gamepad = navigator.getGamepads()[0];

						if(gamepad && 'buttons' in gamepad && 'axes' in gamepad)
						{
							for(var i in gamepad.buttons)
							{
								if(gamepad.buttons[i].pressed)
								{
									if(game.padStates[i] !== undefined)
									{
										game.padStates[i]++;
									}
									else
									{
										game.padStates[i] = 1;
									}
								}
								else
								{
									if(game.padStates[i] !== undefined && game.padStates[i])
									{
										game.padStates[i] = 0;
									}
									else if(game.padStates[i] === 0)
									{
										delete game.padStates[i]
									}
								}
							}

							game.padAxes = gamepad.axes;
						}
					}

					/*if(game.keyStates[109] === 0)
					{
						game.dev = !game.dev;

						if(game.dev && game.editor.tempMapExists())
						{
							game.editor.loadTempMap();
						}
					}*/

					if(game.keyStates[221] === 0)
					{
						var state = JSON.parse(localStorage.getItem('saveState'));

						console.log(state);

						if(game.currentState.world)
						{
							game.currentState.world.mapSet.mapStates = state.maps;
							game.currentState.world.mapSet.switchMap(
								state.player.map
								, state.player.x
								, state.player.y
								, true
							);
						}
					}

					if(game.keyStates[219] === 0)
					{
						if(game.currentState.world)
						{
							game.currentState.world.mapSet.storeState();

							var state = {
								maps: game.currentState.world.mapSet.mapStates
								, player: game.currentState.world.mapSet.playerState
							};

							console.log(state);

							//localStorage.setItem('saveState', JSON.stringify(state));
						}
					}

					//console.log('Before game state update');
					game.currentState.update();
					//console.log('After game state update');
					//console.log('Before editor update');
					game.editor.update();
					//console.log('After editor update');

					game.scrollStates = [];

					for(var i in game.clickVectors)
					{
						game.clickVectors[i].render(game.context);
					}

					if(game.keyStates[109] == 2)
					{
						game.debug.showFPS = !game.debug.showFPS;
					}

					if(game.debug.showFPS)
					{
						game.context.fillStyle = '#FFF';
						game.context.strokeStyle = '#000';
						game.context.font = '14pt bold arial';
						game.context.lineWidth = 1;
						game.context.strokeText(
							fps
							, 10
							, game.canvas.height() - 40
						);
						game.context.fillText(
							fps
							, 10
							, game.canvas.height() - 40
						);
					}

					game.message.update();


					//console.log('!-----|Main Game Func End|-----!');
				}
				, 8
			);
		}
	})(this);

	gameLoopFunc();

	var _this = this;

	$(document).keydown(
		function(e)
		{
			if(_this.keyStates[ e.keyCode || e.which ])
			{
				//NOOP
			}
			else
			{
				_this.keyStates[ e.keyCode || e.which ] = 1;
			}

			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}
		}
	);

	$(document).keyup(
		function(e)
		{
			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}

			_this.keyStates[ e.keyCode || e.which] = 0;

			_this.doNextUpAction();
		}
	);

	$(document).bind(
		"contextmenu"
		, function(e)
		{
			e.preventDefault();
		}
	);

	$(document).bind(
		"touchstart"
		, function(e)
		{
			e.preventDefault();
			var touches = e.originalEvent.changedTouches;
			var i = 0;
			while(i < touches.length)
			{
				var ii = i;

				if(i == 1)
				{
					ii = 2;
				}

				if(
					_this.mouseStates[ ii ]
					&& _this.mouseStates[ ii ].length == 3
					&& _this.mouseStates[ ii ][2]
				){
					//NOOP
				}
				else
				{
					_this.mouseStates[ ii ] = [
						touches[ ii ].pageX
						, touches[ ii ].pageY
						, 1
					];
				}

				i++;
			}
			return false;
		}
	);

	$(document).mousedown(
		function(e)
		{
			if(
				_this.mouseStates[ e.button ]
				&& _this.mouseStates[ e.button ].length == 3
				&& _this.mouseStates[ e.button ][2]
			){
				//NOOP
			}
			else
			{
				_this.mouseStates[ e.button ] = [e.pageX, e.pageY, 1];
			}
		}
	);

	$(document).bind(
		"touchend"
		, function(e)
		{
			var touches = e.originalEvent.changedTouches;
			var i = 0;
			while(i < touches.length)
			{
				var ii = i;

				if(i == 1)
				{
					ii = 2;
				}

				_this.mouseStates[ ii ] = [
					touches[ ii ].pageX
					, touches[ ii ].pageY
					, 0
				];

				i++;
			}
		}
	);

	$(document).mouseup(
		function(e)
		{
			_this.mouseStates[ e.button ] = [e.pageX, e.pageY, 0];

			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}

			_this.doNextUpAction();
		}
	);

	window.mouseX = 0;
	window.mouseY = 0;

	$(document).bind(
		"touchmove"
		, function(e)
		{
			var touches = e.originalEvent.changedTouches;
			var i = 0;
			while(i < touches.length)
			{
				var ii = i;

				if(i == 1)
				{
					ii = 2;
				}

				window.mouseX = touches[ ii ].pageX;
				window.mouseY = touches[ ii ].pageY;

				i++;
			}

			return false;
		}
	);

	$(document).mousemove(
		function(e)
		{
			window.mouseX = e.pageX;
			window.mouseY = e.pageY;
		}
	);

	$(document).bind(
		'mousewheel DOMMouseScroll'
		, function(e)
		{
			if(e.originalEvent.wheelDelta /120 > 0)
			{
				console.log(
					"scrollUp at ("
					+ window.mouseX + ", "
					+ window.mouseY + ")"
				);
				_this.scrollStates[1] = true;
			}
			else
			{
				console.log(
					"scrollDown at ("
					+ window.mouseX + ", "
					+ window.mouseY + ")"
				);
				_this.scrollStates[0] = true;
			}

			console.log(
				document.activeElement
				, _this.canvas[0]
				, document.activeElement === _this.canvas[0]
			);

			if(document.activeElement === _this.canvas[0])
			{
				e.preventDefault();
			}
		}
	);
}
function ImageCache()
{
	this.images = [];
	this.loadImage = function(src, onLoad, reCallOnLoad)
	{
		if(!this.spritesheet)
		{
			this.spritesheet = new Spritesheet;
		}
		
		var name;

		if(!src.match)
		{
			console.log(src);
		}

		if(name = src.match(/^sprite\:(.+)/))
		{
			src = this.spritesheet.getFrame(name[1]);
		}

		if(	
		   this.images[src]
		   && this.images[src].complete
		   && reCallOnLoad
		){
			var onLoadImg = this.images[src].onload;

			if(onLoad)
			{
				onLoad.apply(this.images[src]);
			}
			else if(onLoadImg)
			{

				onLoadImg.apply(this.images[src]);
			}
		}

		if(!this.images[src])
		{
			this.images[src] = new Image();
			this.images[src].onload = onLoad;
			this.images[src].src = src;
		}

		return this.images[src];
	}

	return this;
}

var imageCache = new ImageCache();
function Pane(imgData, x, y)
{
	this.imgData	= imgData;
	this.x			= x;
	this.y			= y;
}
function Viewport(game, x, y, size)
{
	var canvas		= game.canvas;
	this.game		= game;
	this.canvas     = canvas;
	this.context	= canvas[0].getContext('2d');
	this.x          = x     || 5;
	this.y          = y     || 5;
	this.size       = size  || 16;

	this.maxX       = x;
	this.maxY       = y;

	this.updateRadius = 5;

	this.paused		= false;

	this.world;

	this.xOffset    = 0;
	this.yOffset    = 0;

	this.xPosition  = 0;
	this.yPosition  = 0;

	this.lastXPosition = 1;
	this.lastYPosition = 1;

	this.xDraw		= 0;
	this.yDraw		= 0;

	this.lastXDraw	= 1;
	this.lastYDraw	= 1;

	this.forceUpdateFlag = 0;

	this.cacheBG	= null;

	this.actor;

	this.nextMoveInfo = null;

	this.updateObjectsEarly = [];

	this.panes = [];
	this.panesXY = [];
	this.paneSize	= 12;
	this.maxPanes	= 9;

	this.orientation = false;
	this.lastResize = false;

	this.panesToEdgeX = Math.floor((this.x/2)/this.paneSize)+1;
	this.panesToEdgeY = Math.floor((this.y/2)/this.paneSize)+1;

	var center	= [
		Math.ceil(this.x/2)
		, Math.ceil(this.y/2)
	];

	this.updateEarly = function(object)
	{
		this.updateObjectsEarly.push(object);
	}

	this.bindWorld  = function(world)
	{
		this.world  = world;

		this.world.bindViewport(this);

		this.world.setTileSize(this.size);
	}

	this.forceTileUpdate = function(x,y)
	{
		if(!this.panesXY[Math.floor(x/this.paneSize)])
		{
			return;
		}

		this.panesXY
			[Math.floor(x/this.paneSize)]
			[Math.floor(y/this.paneSize)] = undefined;
	}

	this.forceBgUpdate	= function()
	{
		this.panes = [];
		this.panesXY = [];
		this.forceUpdateFlag = true;
	}

	this.bindCamera				= function(actor)
	{
		if(!actor)
		{
			return;
		}
		
		this.actor				= actor;

		this.warp(
			this.actor.x - (center[0]-1)
			, this.actor.y - (center[1]-1)
		);
	}

	this.unBindCamera			= function(actor)
	{
		if(this.actor === actor)
		{
			this.actor = null;
		}
	}

	this.togglePause = function()
	{
		this.paused = !this.paused;
	}

	this.resize		= function()
	{
		var docWidth  =  $(document).width();
		var docHeight =  $(document).height();
		var newX;

		if(this.maxX * this.size > docWidth)
		{
			this.x = Math.floor(docWidth / this.size) + 1;
		}
		else
		{
			this.x = this.maxX;
		}

		if(this.maxY * this.size > docHeight)
		{
			this.y = Math.floor(docHeight / this.size) + 1;
		}
		else
		{
			this.y = this.maxY;
		}

		center	= [
			Math.ceil(this.x/2)
			, Math.ceil(this.y/2)
		];

		this.bindCamera(this.actor);
		
		this.panesToEdgeX = Math.floor((this.x/2)/this.paneSize)+1;
		this.panesToEdgeY = Math.floor((this.y/2)/this.paneSize)+1;

		if(this.canvas)
		{
			this.canvas[0].setAttribute('width', this.x * this.size);
			this.canvas[0].setAttribute('height', this.y * this.size);
		}

		this.renderWidth   = (this.x * this.size);
		this.renderHeight  = (this.y * this.size);

		this.renderCenter	= [this.renderWidth/2,this.renderHeight/2];

		this.renderBreadth    = [
			Math.round(this.x * this.size / 2)
			, Math.round(this.y * this.size / 2)
		];

		if(this.canvas)
		{
			this.canvasOffsetX = $(this.canvas).offset().left;
			this.canvasOffsetY = $(this.canvas).offset().top;
		}
	};

	this.resize();

	this.overlayColor = null;
	this.overlayOpacity = null;

	this.overlay = function(color, opacity)
	{
		this.overlayColor = color;
		this.overlayOpacity = opacity;
	}

	this.removeOverlay = function()
	{
		this.overlayColor = null;
		this.overlayOpacity = null;
	}

	this.fadeOverlayFrames = 0;
	this.fadeOverlayFramesMax = 0;

	this.fadeOverlay= function(frameCount)
	{
		this.fadeOverlayFrames = frameCount;
		this.fadeOverlayFramesMax = frameCount;
	}

	this.context	= canvas[0].getContext('2d');
	var context		= this.context;

	this.cachePane	= function(pane, x, y)
	{
		if(this.panes.length >= this.maxPanes)
		{
			var deadPane = this.panes.pop();

			if(!this.panesXY[deadPane.x])
			{
				this.panesXY[deadPane.x] = [];
			}

			this.panesXY[deadPane.x][deadPane.y] = null;
		}

		this.panes.unshift(pane);

		if(!this.panesXY[x])
		{
			this.panesXY[x] = [];
		}

		this.panesXY[x][y] = pane;
	}

	this.renderPane	=  function(x, y, forceUpdate)
	{
		var virtualCanvas	= document.createElement('canvas');
		var virtualContext	= virtualCanvas.getContext('2d');

		var pane;
		var xPane = x * this.paneSize;
		var yPane = y * this.paneSize;

		if(!(this.panesXY[x] && this.panesXY[x][y]))
		{
			// console.log('RENDER PANE', x, y);
			virtualCanvas.width = this.paneSize * this.size;
			virtualCanvas.height = this.paneSize * this.size;

			for(var xI = xPane; xI < xPane + this.paneSize; xI++){
			for(var yI = yPane; yI < yPane + this.paneSize; yI++){
				this.world.renderTile(
					virtualContext
					, xI
					, yI
					, (xI-xPane) * this.size
					, (yI-yPane) * this.size
				);
			}}

			pane = new Pane(
				virtualContext.getImageData(
					0 ,0
					, this.paneSize * this.size
					, this.paneSize * this.size
				)
			);

			this.cachePane(pane, x ,y);
		}
		else
		{
			pane = this.panesXY[x][y];
		}

		this.context.putImageData(
			pane.imgData
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
		);

		this.context.fillStyle = '#0FF'
		this.context.strokeStyle = '#0FF'
		this.context.lineWidth = 1;
		this.context.font = '11pt bold arial';
/*
		this.context.fillText(
			"(" + xPane + ", " + yPane + ")"
			+ " : (" + x + ", " + y + ") \n"
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
				+ 20
		);
		this.context.fillText(
			" : (" +( (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			)+ ", " +( (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset +")"
			)+ forceUpdate
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
				+ 40
		);
		this.context.fillText(
			this.yPosition
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
				+ 60
		);
 *//*
		this.context.strokeRect(
			(xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
			, this.paneSize * this.size
			, this.paneSize * this.size
		);
   */
	}

	this.render     = function()
	{
		if(this.paused)
		{
			return;
		}

		context.strokeStyle = 'white';

		context.beginPath();
		context.save();

		context.rect(
			Math.floor(
				this.renderCenter[0]
				- this.renderBreadth[0]
			)
			, Math.floor(
				this.renderCenter[1]
					- this.renderBreadth[1]
			)
			, this.x * this.size
			, this.y * this.size
		);

		context.clip();

		context.fillStyle = '#0FF';
		context.fillRect(
			Math.floor(
				this.renderCenter[0]
				- this.renderBreadth[0]
			)
			, Math.floor(
				this.renderCenter[1]
					- this.renderBreadth[1]
			)
			, this.x * this.size
			, this.y * this.size
		);

		var shiftX = Math.floor((
			this.xPosition + Math.floor(this.renderBreadth[0]/this.size)
		) / this.paneSize);
		var shiftY = Math.floor((
			this.yPosition + Math.floor(this.renderBreadth[1]/this.size)
		) / this.paneSize);

		for(var xI = shiftX - (this.panesToEdgeX);
			xI <= shiftX + (this.panesToEdgeX);
			xI+=1
		){
			for(var yI = shiftY - (this.panesToEdgeY);
				yI <= shiftY + (this.panesToEdgeY);
				yI+=1
			){
				this.renderPane(xI, yI);
			}
		}

		this.lastXDraw = this.xDraw;
		this.lastYDraw = this.yDraw;

		var xStart	= -this.x + this.xPosition;
		var xEnd	= this.x + this.xPosition+2;
		var xInc	= 1;

		var yStart	= -this.y + this.yPosition;
		var yEnd	= this.y + this.yPosition +2;
		var yInc	= 1;

		for(
			var yI = yStart;
			yI != yEnd;
			yI += yInc
		){
			for(
				var xI = xStart;
				xI != xEnd;
				xI += xInc
			){
				if(this.world.isWall(xI, yI)
					&& xI >= -1
					&& yI >= -1
					&& xI <= this.world.worldWidth
					&& yI <= this.world.worldHeight
					&& this.game.dev
				){
					context.strokeStyle = '#f00';

					context.strokeRect(
						xI * this.size
							- (this.xPosition * this.size)
						, yI * this.size
							- (this.yPosition * this.size)
						, this.size
						, this.size
					);
				}
				else if(xI >= -1
					&& yI >= -1
					&& xI <= this.world.worldWidth
					&& yI <= this.world.worldHeight
					&& this.game.dev
				){
					/*
					context.strokeStyle = '#000';

					context.strokeRect(
						xI * this.size
							- (this.xPosition * this.size)
						, yI * this.size
							- (this.yPosition * this.size)
						, this.size
						, this.size
					);
					*/
				}

				for(var oI in this.world.getObjects(xI, yI))
				{
					var obj = this.world.getObjects(xI, yI)[oI];

					if(obj)
					{
						if(this.game.dev)
						{
							context.strokeStyle = '#00f';

							context.strokeRect(
								xI * this.size
									- (this.xPosition * this.size)
								, yI * this.size
									- (this.yPosition * this.size)
								, this.size
								, this.size
							);
						}

						if(this.game.dev && obj instanceof FloorActor)
						{
							context.drawImage(
								imageCache.loadImage(
									obj.sprite.standard()[0]
								)
								, xI * this.size
									- (this.xPosition * this.size)
								, yI * this.size
									- (this.yPosition * this.size)
								, this.size
								, this.size
							);
						}

						obj.render(
							context
							, this.xPosition
							, this.yPosition
							, (xI - this.xPosition) * this.size
								+ this.renderCenter[0]
								- this.renderBreadth[0]
								+ this.xOffset
							, (yI - this.yPosition) * this.size
								+ this.renderCenter[1]
								- this.renderBreadth[1]
								+ this.yOffset
							, this.size
						);
					}
				}
			}
		}

		if(this.overlayColor)
		{
			context.fillStyle = this.overlayColor;

			context.globalAlpha = this.overlayOpacity;

			if(this.fadeOverlayFrames)
			{
				context.globalAlpha = this.overlayOpacity *
					(this.fadeOverlayFrames / this.fadeOverlayFramesMax);

				this.fadeOverlayFrames--;

				if(!this.fadeOverlayFrames)
				{
					this.removeOverlay();
				}
			}

			context.fillRect(
				Math.floor(
					this.renderCenter[0]
					- this.renderBreadth[0]
				)
				, Math.floor(
					this.renderCenter[1]
						- this.renderBreadth[1]
				)
				, this.x * this.size
				, this.y * this.size
			);

			context.globalAlpha = 1;
		}

		if(this.game.dev
		    && this.game.editor
			&& this.game.editor.startSelectedTile
			&& this.game.editor.selectedTile
		){
			context.strokeStyle = '#0ff';

			var xAdd = 0;
			var yAdd = 0;
			var xAddEnd = 1;
			var yAddEnd = 1;

			if(this.game.editor.startSelectedTile[0] > this.game.editor.selectedTile[0])
			{
				xAdd = 1;
				xAddEnd = -1;
			}

			if(this.game.editor.startSelectedTile[1] > this.game.editor.selectedTile[1])
			{
				yAdd = 1;
				yAddEnd = -1;
			}

			context.strokeRect(
				this.game.editor.startSelectedTile[0] * this.size
					- (this.xPosition * this.size)
					+ (xAdd * this.size)
				, this.game.editor.startSelectedTile[1] * this.size
					- (this.yPosition * this.size)
					+ (yAdd * this.size)
				, this.size *
					(this.game.editor.selectedTile[0] - this.game.editor.startSelectedTile[0] + xAddEnd)
				, this.size *
					(this.game.editor.selectedTile[1] - this.game.editor.startSelectedTile[1] + yAddEnd)
			);

			context.fillStyle = '#033';
			context.strokeStyle = '#0EE';
			context.font = '15pt bold sans';

			context.strokeText(
				(this.game.editor.startSelectedTile[0])
				+ ", "
				+ (this.game.editor.startSelectedTile[1])
				+ ' - '
				+ (this.game.editor.selectedTile[0])
				+ ", "
				+ (this.game.editor.selectedTile[1])
				, this.game.editor.startSelectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.startSelectedTile[1] * this.size
					- (this.yPosition * this.size) - 10
			);

			context.fillText(
				(this.game.editor.startSelectedTile[0])
				+ ", "
				+ (this.game.editor.startSelectedTile[1])
				+ ' - '
				+ (this.game.editor.selectedTile[0])
				+ ", "
				+ (this.game.editor.selectedTile[1])
				, this.game.editor.startSelectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.startSelectedTile[1] * this.size
					- (this.yPosition * this.size) - 10
			);
		}
		else if(this.game.dev && this.game.editor && this.game.editor.selectedTile)
		{
			context.strokeStyle = '#0ff';

			context.strokeRect(
				this.game.editor.selectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.selectedTile[1] * this.size
					- (this.yPosition * this.size)
				, this.size
				, this.size
			);

			context.fillStyle = '#0FF';

			context.fillText(
				(this.game.editor.selectedTile[0])
				+ ", "
				+ (this.game.editor.selectedTile[1])
				, this.game.editor.selectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.selectedTile[1] * this.size
					- (this.yPosition * this.size) - 10
			);
		}

		context.restore();
	}

	

	this.update     = function(input)
	{
		//console.log(this.actor);

		if (input.keyStates[16] == 1)
		{
			this.togglePause();
		}

		if(this.paused)
		{
			return;
		}

		this.mouseTile = [
			Math.floor((window.mouseX - this.canvasOffsetX)/this.size)
			, Math.floor((window.mouseY - this.canvasOffsetY)/this.size)
		];

		if(this.actor && this.actor.getMove)
		{
			this.nextMoveInfo = this.actor.getMove(input);
		}

		var xStart	= this.x + this.xPosition + this.updateRadius;
		var xEnd	= -this.x  + this.xPosition  - this.updateRadius;
		var xInc	= -1;

		var yStart	= -this.y + this.yPosition - this.updateRadius;
		var yEnd	= 1 + this.y + this.yPosition + this.updateRadius;
		var yInc	= 1;
		var earlyList = {};

		for(var eI in this.updateObjectsEarly)
		{
			if(!this.updateObjectsEarly[eI] || this.game.dev)
			{
				continue;
			}

			this.updateObjectsEarly[eI].update(input);

			earlyList[
				this.updateObjectsEarly[eI].x
				+ '' + this.updateObjectsEarly[eI].y
				+ '' + this.updateObjectsEarly[eI].i
			] = true;
		}

		for(
			var xI = xStart;
			xI != xEnd;
			xI += xInc
		){
			for(
				var yI = yStart;
				yI != yEnd;
				yI += yInc
			){
				for(var oI in this.world.getObjects(xI, yI))
				{
					var currentObject = this.world.getObjects(xI, yI)[oI];

					if(currentObject
					   && ! currentObject.heldBy
					   && ! currentObject.master
					   && this.game.dev === false
					){
						currentObject.update(input);
					}
				}
			}
		}

		var processing = true;
		var lastDitch = true;
		var loops = 0;

		while(processing)
		{
			processing = !this.world.processStepMatrix();

			if(!processing && lastDitch)
			{
				processing = true;
				lastDitch = false;
			}

			loops++;
		}

		var notMoved = this.world.stepMatrixContents();

		for(var i in notMoved)
		{
			if(notMoved[i].pusher)
			{
				notMoved[i].crush(notMoved[i].pusher);
			}
		}

		//console.log('StepMatrix Looped ' + loops + ' times.', this.world.stepMatrixContents());

		this.world.refreshStepMatrix();

		if(this.actor)
		{
			this.warp(
				this.actor.x - (center[0]-1)
				, this.actor.y - (center[1]-1)
			);

			this.xOffset = -this.actor.getOffsetX(this.size);
			this.yOffset = -this.actor.getOffsetY(this.size);
		}
	}

	this.warp       = function(x, y)
	{
		this.xPosition = x;
		this.yPosition = y;
	}
}
var IceBlock = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new IceBlockSprite());
	}
	, reinit: function()
	{
		this.name = 'IceBlock';
		this._super(new IceBlockSprite());
	}
});
var Box = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BoxSprite());
		// console.log('NEW BOX');
	}
	, reinit: function()
	{
		this.name = 'Box';
		this._super(new BoxSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
	, canSpawn: function()
	{
		return false;
	}
	, announceDeath: function()
	{
		
	}
});
var HollowBox = Box.extend({
	canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
});
var BlastMark = FloorActor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BlastMarkSprite());
		this.persistent = true;
	}
	, reinit: function()
	{
		this.name = 'BlastMark';
		this._super(new BlastMarkSprite());
	}
	, steppedOn: function()
	{
		return true;
	}
	, canSpawn: function()
	{
		return true;
	}
});
var Pit = StepTrigger.extend({
	init: function()
	{
		this.reinit();
		this._super(new PitSprite());
	}
	, reinit: function()
	{
		this.name = 'Pit';
		this._super(new PitSprite());
	}
	, onTrigger: function(stepper)
	{
		if(stepper.destroy)
		{
			stepper.destroy(true);
		}
	}
});
var Angle = Bindable.extend({
	init: function(direction)
	{
		if(direction === undefined)
		{
			direction = 3;
		}

		this.angleDirection = direction;
		
		this._super(new AngleSprite());
		this.reinit();
	}
	, reinit: function()
	{
		this.name = 'Angle';
		this._super(new AngleSprite());
		this.updateSprite();
	}
	, push: function(pusher)
	{
		this.direction = pusher.direction;
		if(pusher instanceof Projectile)
		{
			if(pusher.direction == (this.angleDirection+1)%4)
			{
				//return this._super(pusher);
			}

			if(pusher.direction == (this.angleDirection+4)%4)
			{
				//return this._super(pusher);
			}

			return false;
		}

		return this._super(pusher);
	}
	, canBePushed: function(pusher)
	{
		this.direction = pusher.direction;
		if(pusher instanceof Projectile)
		{
			if(pusher.direction == (this.angleDirection+1)%4)
			{
				//return this._super(pusher);
			}

			if(pusher.direction == (this.angleDirection+4)%4)
			{
				//return this._super(pusher);
			}

			return false;
		}

		return this._super(pusher);
	}
	, canBeSteppedOn: function(stepper)
	{
		if(stepper instanceof Projectile)
		{
			if(stepper.direction == (this.angleDirection+2)%4)
			{
				return true;
			}

			if(stepper.direction == (this.angleDirection+3)%4)
			{
				return true;
			}

			return false;
		}

		return this._super(stepper);
	}
	, update: function()
	{
		this._super();

		var coObj = this.world.getObjects(this.x, this.y);

		for(var i in coObj)
		{
			if(coObj[i] !== this
				&& coObj[i].direction == ((this.angleDirection+2)%4)
			){
				coObj[i].turnNext((coObj[i].direction+3)%4);
			}
			else if(coObj[i] !== this
				&& coObj[i].direction == ((this.angleDirection+3)%4)
			){
				coObj[i].turnNext((coObj[i].direction+1)%4);
			}
		}

		if(coObj[i]
			&& coObj[i] instanceof Projectile
			&& !coObj[i].canStep()
		){
			var blocking = coObj[i].whyCantStep();

			for(var j in blocking)
			{
				if(blocking[j] && blocking[j].collide)
				{
					coObj[i].collide(blocking[j]);
					blocking[j].collide(coObj[i]);
				}
			}

			coObj[i].turnNext((coObj[i].direction+2)%4);
		}

		this.updateSprite();
	}
	, updateSprite: function()
	{
		if(this.angleDirection == 0)
		{
			this.frames = this.sprite.standing.east;
		}
		else if(this.angleDirection == 1)
		{
			this.frames = this.sprite.standing.south;
		}
		else if(this.angleDirection == 2)
		{
			this.frames = this.sprite.standing.west;
		}
		else if(this.angleDirection == 3)
		{
			this.frames = this.sprite.standing.north;
		}
	}
});
var WoodBox = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new WoodBoxSprite(), 200);
		this.deathNoteColor = 'better';
	}
	, reinit: function()
	{
		this.name = 'WoodBox';
		this.sprite = new WoodBoxSprite();
	}
	, useFacing: function(user)
	{
		if(user.invincible)
		{
			return this._super(user);
		}
	}
	, push: function(pusher)
	{
		if(pusher.invincible)
		{
			return this._super(pusher);
		}

		this.collide(pusher);
		pusher.collide(this);

		return false;
	}
	, canBePushed: function(pusher)
	{
		if(pusher.invincible)
		{
			return this._super(pusher);
		}

		return false;
	}
	, damage: function(){}
	, explosionDamage: function(amount)
	{
		this._damage(amount);
	}
	, fireDamage: function(amount)
	{
		if(this.cheesed)
		{
			this._damage(Math.ceil(amount/100));
		}
	}
});
var Sandbag = Bindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new SandbagSprite());
	}
	, reinit: function()
	{
		this.name = 'Sandbag';
		this._super(new SandbagSprite());
	}
	, canBePushed: function(pusher)
	{
		if(pusher instanceof Projectile)
		{
			return false;
		}

		return this._super(pusher);
	}
	, push: function(pusher)
	{
		if(pusher instanceof Projectile)
		{
			return false;
		}

		return this._super(pusher);
	}
});
function SignPost(text)
{
	var actor		= new Actor(new SignPostSprite());

	for(var i in actor)
	{
		this[i]		= actor[i];
	}

	this.text = text;
	this.used = false;

	this.useFacing	= function(user)
	{
		//console.log('!!!!! SIGNPOST: ' + this.text);
		this.used = true;
	}

	this.__update	= this.update;
	this.update     = function(input)
	{
		if(this.used)
		{
			this.used = false;
			this.world.game.stackState('dialog', {text: this.text});
		}

		this.__update();
	}
}
var PartySpawner = Actor.extend({
	init: function(party)
	{
		this.name = 'PartySpawner';
		this._super(new BarrelSprite);
		this.party = party;
		this.doNotStore = true;
	}
	, update: function()
	{
		this._super();

		if(
			this.world.canSpawn(this.x, this.y)
			&& this.party.length
		){
			this.world.addObject(
				this.party.pop()
				, this.x
				, this.y
			);
		}

		if(!this.party.length)
		{
			this.destroy(true);
			console.log('REMOVING PARTY SPAWNER');
		}
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function()
	{

	}
});
var BloodStain = FloorActor.extend(Corpse).extend({
	init: function()
	{
		this.reinit();
		this._super(new BloodStainSprite());
		this.persistent = true;
	}
	, reinit: function()
	{
		this.name = 'BloodStain';
		this._super(new BloodStainSprite());
	}
});var Cheese = Bindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new CheeseSprite());
	}
	, reinit: function()
	{
		this.name = 'Cheese';
		this._super(new CheeseSprite());
	}
	, collide: function(other)
	{
		//console.log(other);
		this._super(other);
		if(other instanceof Projectile && !other.cheesed)
		{
			scaleColorFunc = this.scaleColors(
				0.2//Math.random()
				, 1.25//Math.random()
				, 1.75//Math.random()
				, 1
			);
			other.speed = 2;
			
			var stepRatio = other.stepTimer/other.stepTime;
			other.damage *= 4;
			//other.stepTimer = other.speed * stepRatio;
			//other.stepTime = other.speed;

			other.alterSprite(scaleColorFunc);
		}
		if(other instanceof Barrel && !other.cheesed)
		{
			scaleColorFunc = this.scaleColors(
				1.5//Math.random()
				, 0.75//Math.random()
				, 0.75//Math.random()
				, 1
			);
			other.speed = 4;
			other.alterSprite(scaleColorFunc);
			other.setHealth(5);
		}
		if(other instanceof WoodBox && !other.cheesed)
		{
			swapColorFunc = this.swapColors(0,0,0,3);
			other.alterSprite(swapColorFunc);
			other.setHealth(5);
		}
		if(other instanceof Cheese && !other.cheesed)
		{
			swapColorFunc = this.swapColors(
				2
				, 1
				, 0
				, 3
			);
			scaleColorFunc = this.scaleColors(
				0.1//Math.random()
				, 0.7//Math.random()
				, 1//Math.random()
				, 1
			);
			other.alterSprite(swapColorFunc);
			//other.alterSprite(scaleColorFunc);
		}
		if(other)
		{
			other.cheesed = true;
		}
	}
	, crush: function(other)
	{
		this._super(other);
		this.collide(other);
	}
});
var CloningNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/cloning.wav');
var CloneMachine = Actor.extend({
	init: function()
	{
		this.coolDownTime	= 15;
		this.coolDown		= 0;
		this.cloneCount		= 0;
		this.fire           = 0;
		this.maxClones		= 3;
		this.col			= 0;
		this.frameTime		= 1;
		this.spacesBack		= 0;
		this.reinit();
		this._super(new ComputerSprite());
	}
	, reinit: function()
	{
		this.name = 'CloneMachine';
		this._super(new ComputerSprite());
		this.cloningNoise	= CloningNoise;
		this.tileSet		= false;
	}
	, update: function()
	{
		if(this.coolDown == 1)
		{
			if(this.cloneCount >= this.maxClones)
			{
				/*this.world.game.stackState(
					'dialog',
					{text: 'Machine resources exhausted.'},
					true
				);*/

				//console.log('boom!');
				//this.destroy();
				return;
			}

			/*
			this.world.game.stackState(
				'dialogMenu', {
					text: "Clone dispensed."
					, menu: new ContinueMenu(this.world.game)
				}, true
			);
			*/

			this.world.game.message.blit('Clone dispensed.', 150, this.cloneCount ? 'good' : 'better');

			var spawnShift = 0;

			while(!this.world.canSpawn(
				this.x-1+(this.cloneCount+spawnShift)%3
				, this.y+1+Math.floor((this.cloneCount+spawnShift)/3)+1
			)){
				spawnShift++;
			}

			var clone = new PlayerClone(new PlayerSprite());

			this.world.addObject(
				clone
				, this.x-1+(this.cloneCount+spawnShift)%3
				, this.y+1+Math.floor((this.cloneCount+spawnShift)/3)+1
			);

			if(this.user && this.user.addParty && !this.user.master)
			{
				this.user.addParty(clone);
			}
			else
			{
				var rootUser = this.user;

				while(rootUser && rootUser.master)
				{
					rootUser = rootUser.master;
				}

				rootUser.addParty(clone);
			}

			this.cloneCount++;
		}

		if(this.coolDown > 0)
		{
			this.frames = this.sprite.warm.south;
			this.coolDown--;
		}
		else
		{
			this.frames = this.sprite.standing.south;
		}

		if(this.tileSet === false)
		{
			this.tileSet = this.world.addTile(
				this.x
				, this.y+1
				, this.sprite.standing.south_bottom
				, false
			);
		}

		this._super();
	}

	, useFacing: function(user)
	{
		if(this.coolDown == 0)
		{
			if(this.cloneCount >= this.maxClones)
			{
				this.world.game.message.blit('Clone Machine resources exhausted.');
				return;
			}

			this.cloningNoise.play();
			this.coolDown = this.coolDownTime;
			this.user = user;
		}
	}
	, destroy: function()
	{
		if(this.tileSet !== false)
		{
			this.world.removeTile(
				this.x
				, this.y+1
				, this.tileSet
			);
		}
		this._super();
	}
});
var AbstractTriggerableAny = TriggerableAny.extend({
	init: function()
	{
		this.reinit();
		this._super();
	}
	, reinit: function()
	{
		this.name = 'AbstractTriggerableAny';
		this._super(new TriggerSprite());
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function()
	{

	}
});
var Boxes = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BoxesSprite());
		// console.log('NEW BOXES');
	}
	, reinit: function()
	{
		this.name = 'Boxes';
		this._super(new BoxesSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
	, canSpawn: function()
	{
		return false;
	}
	, announceDeath: function()
	{
		
	}
});
var Barrier = FloorTrigger.extend({
	init: function()
	{
		this._super(new BarrierSprite());
		this.reinit();
	}
	, reinit: function()
	{
		this.name = 'Barrier';
		this._super(new BarrierSprite());
		this.dontPortal = true;
		this.ignoreTypes = [
			Player
			, LaserBeam
			, FloorActor
		];
		this.dontIgnoreTypes = [
			Portal
		];
	}
	, update: function()
	{
		this.triggered = false;

		var coObjs = this.world.getObjects(this.x, this.y);

		coObjs:
		for(var i in coObjs)
		{
			if(coObjs[i] === this)
			{
				continue;
			}
			
			ignore:
			for(var j in this.ignoreTypes)
			{
				if(coObjs[i] instanceof this.ignoreTypes[j])
				{
					for(var k in this.dontIgnoreTypes)
					{
						if(coObjs[i] instanceof this.dontIgnoreTypes[k])
						{
							continue ignore;
						}
					}

					if(
						coObjs[i].stepping
						|| !coObjs[i].holding
						|| coObjs[i].holding instanceof this.ignoreTypes[j]
					){
						continue coObjs;
					}
				}
			}

			console.log(coObjs[i].name);

			this.trigger();

			/*
			var skip = false;

			for(var j in this.ignoreTypes)
			{
				if(coObjs[i] instanceof this.ignoreTypes[j])
				{
					skip = true;
				}
			}

			if(coObjs[i] !== this
				&& coObjs[i].stepTimer === 0
				&& !skip
			){
				//console.log(coObjs[i]);
				this.trigger();
			}
			*/
		}

		this._super();
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
});
	var Portal = FloorBindable.extend({
		init: function()
		{
			this.reinit();
			this._super(new PortalSprite());		
		}
		, reinit: function()
		{
			this.name = 'Portal';
			this.orange = false;
			this.suppress = false;
			this.sticky = false;
			this.recieved = null;
			this._super(new PortalSprite());
		}
		, canBeSteppedOn: function(stepper)
		{
			if(stepper instanceof FloorActor)
			{
				return false;
			}
			
			return true;
		}
		, push: function(pusher)
		{
			if(pusher instanceof FloorBindable || pusher instanceof FloorActor)
			{
				this._super(pusher);
			}
			else
			{
			}
		}
		, canBePushed: function(pusher)
		{
			return false;

			if(pusher instanceof Player)
			{
				return false;
			}

			var blockers = this.whyCantStep();

			if(pusher instanceof FloorActor)
			{
				if(this.heldBy)
				{
					this.heldBy.stopHolding();
				}

				if(pusher.heldBy)
				{
					pusher.heldBy.stopHolding();
				}

				return false;
			}
			
			for(var i in blockers)
			{
				if(blockers[i] instanceof FloorActor)
				{
					if(this.heldBy)
					{
						this.heldBy.stopHolding();
					}

					return false;
				}
			}

			if(this.heldBy == pusher)
			{
				return this._super(pusher);
			}
			
			return false;
		}
		, onTrigger: function(stepper)
		{
			if(stepper instanceof FloorActor)
			{
				return;
			}

			if(this.recieved === stepper)
			{
				return;
			}

			if(stepper.stepping)
			{
				return;
			}

			var blockers;

			block:
			for(var i in this.triggers)
			{
				blockers = this.world.getObjects(
					this.triggers[i].x
					, this.triggers[i].y
				);

				for(var j in blockers)
				{
					if(blockers[j].canBePushed(stepper))
					{
						blockers[j].push(stepper);
						break;
					}

					if(!blockers[j].canBeSteppedOn())
					{
						continue block;
					}
				}

				if(stepper.dontPortal)
				{
					return;
				}

				this.triggers[i].recieved = stepper;

				if(stepper.holding)
				//if(stepper.holding == this.triggers[i])
				{
					stepper.stopHolding();
				}

				if(this.triggers[i].heldBy)
				{
					this.triggers[i].heldBy.stopHolding();
				}

				stepper.jump(
					this.triggers[i].x
					, this.triggers[i].y
				);

				this.world.viewport.overlay('#000', 1);
				this.world.viewport.fadeOverlay(4);

				break;
			}

			this.triggered = false;
		}
		, update: function()
		{
			this._super();

			if(this.orange)
			{
				this.frames = this.sprite.standing.east;
			}

			var steppers = this.world.getObjects(this.x, this.y);

			if(steppers.length <= 1)
			{
				this.recieved = null;
			}
		}
	});
function Item(sprite)
{
	var actor		= new Actor(sprite);

	for(var i in actor)
	{
		this[i]		= actor[i];
	}

	this.useFacing	= function()
	{
		this.world.game.stackState(
			'dialog'
			, {text: 'Picked up a ball.'}
			, true
		);

		this.destroy();
	}
}
var Warp = StepTrigger.extend({
	init: function()
	{
		this.toMap = null;
		this.toX = null;
		this.toY = null;
		this.name = 'Warp';
		this.reinit();
		this._super(new WarpSprite);
	}
	, reinit: function()
	{
		this._super(new WarpSprite);
	}
	, onTrigger: function(stepper)
	{
		if(stepper instanceof Player
			&& !(stepper instanceof PlayerClone)
			&& stepper.stepTimer == 0
		){
			this.world.viewport.overlay('#000', 0.9);
			this.world.viewport.fadeOverlay(5);

			console.log('WARP DIRECTION', stepper.direction);

			var spawnPartyX = 0;
			var spawnPartyY = 0;

			if(stepper.direction == stepper.RIGHT)
			{
				spawnPartyX			= -1;
			}
			else if(stepper.direction == stepper.DOWN)
			{
				spawnPartyY			= -1;
			}
			else if(stepper.direction == stepper.LEFT)
			{
				spawnPartyX			= 1;
			}
			else if(stepper.direction == stepper.UP)
			{
				spawnPartyY			= 1;
			}

			var party = stepper.getParty();
			var world = this.world;

			for(var i in party)
			{
				world.removeObject(
					party[i].x
					, party[i].y
					, party[i].i
				);
			}

			world.mapSet.switchMap(
				this.toMap
				, this.toX
				, this.toY
			);

			var partySpawner = new PartySpawner(party);

			world.addObject(
				partySpawner
				, this.toX + spawnPartyX
				, this.toY + spawnPartyY
			);

			partySpawner.update();
		}
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function()
	{

	}
});
var PlasmaBall = Projectile.extend({
	init: function()
	{
		this._super(new FireSprite(), 250, 2, 6);
		this.reinit();
	}
	, reinit: function()
	{
		this.sprite = new FireSprite();
		this.name = 'PlasmaBall';
	}
});
var ExplosionNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/explosion.wav');
var Explosion = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new PitSprite(), 99);
		this.lastCollide		= null;
		this.doDamage			= 1000;
	}
	, reinit: function()
	{
		this.name = 'Explosion';
		this._super(new PitSprite(), 99);
		this.explosionNoise		= ExplosionNoise;
	}
	, update: function()
	{
		this.world.viewport.overlay('#FFF', 1);
		this.world.viewport.fadeOverlay(32);
		this.explosionNoise.play();
		
		var tile = this.world.getTile(this.x, this.y);
		var tiles = [tile, tile.up(), tile.down()
			, tile.left(), tile.right()
			, tile.right().up(), tile.right().down()
			, tile.left().up(), tile.left().down()
		];

		for(var i in tiles)
		{
			var tileObjects = tiles[i].objects();

			for(var j in tileObjects)
			{
				if(tileObjects[j]
					&& tileObjects[j].explosionDamage
					&& tileObjects[j].explosionDamage instanceof Function
				){
					tileObjects[j].explosionDamage(this.doDamage, this);
				}
				else if(tileObjects[j]
					&& tileObjects[j].damage
					&& tileObjects[j].damage instanceof Function
				){
					tileObjects[j].damage(this.doDamage, this);
				}
			}
		}

		this.world.addObject(
			new BlastMark
			, this.x
			, this.y
		);

		this.destroy();
	}
});var Wanderer = DamageableCharacter.extend({
	init: function(sprite, maxHealth)
	{
		this._super(sprite, maxHealth);
		this.corpse = new Corpse(
			new PlayerCorpseSprite()
			, 250
			, new BloodStain()
		);
	}

	, update: function()
	{
		this._super();

		if(!this.stepping)
		{
			if(!this.canStep())
			{
				if(this.backward)
				{
					this.turn(((this.direction-1) % 4));
				}
				else
				{
					this.turn(((this.direction+1) % 4));
				}

				if(!this.canStep())
				{
					this.turn(((this.direction+2) % 4));
					this.backward = 1;
				}

				return;
			}

			if(!this.step(this.stepSpeed) || Math.random() < 0.2)
			{
				this.turn((this.direction+1 % 4));
			}
		}
	}
});
var Bubble = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BubbleSprite());
	}
	, reinit: function()
	{
		this.name = 'Bubble';
		this._super(new BubbleSprite());
		this.preventVacuumDamage = true;
	}
	, steppedOn: function(stepper)
	{
		this.acquire(stepper);
	}
	, useFacing: function(user)
	{
		this.acquire(user)
	}
	, acquire: function(user)
	{
		this.tileOffsetX = -1;
		this.tileOffsetY = -15;

		this.world.removeObject(
			this.x
			, this.y
			, this.i
		);

		if(user.master)
		{
			user = user.master;
		}

		user.acquire(this);

		if(user.party)
		{
			for(var i in user.party)
			{
				var partyObj = new this.__proto__.constructor;

				partyObj.tileOffsetX = -1;
				partyObj.tileOffsetY = -15;

				user.party[i].acquire(partyObj);
			}
		}
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Player);
	}
});
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
Player.deaths = 0;var Corpse = DamageableBindable.extend({
	init: function(sprite, maxHealth, corpse)
	{
		this._super(sprite, maxHealth, corpse);
		this.name = 'Corpse';
		this.ignoreControl = true;
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy && this.lastDamagedBy.name)
		{
			this.world.game.message.blit('Corpse destroyed by a ' + this.lastDamagedBy.name + '.');
		}
		else
		{
			this.world.game.message.blit('Corpse destroyed.');
		}
	}
	, vacuumDamage: function()
	{
		
	}
	, destroy: function(clean)
	{
		if(this.master)
		{
			this.master.removeParty(this)
		}
		
		this._super(clean);
	}
});
var PlayerCorpse = Corpse.extend({
	crush: function(stepper)
	{
		this._super(stepper);
		this.damage(1, stepper);	
	}
});
var Lava = FloorActor.extend({
	init: function()
	{
		this.reinit();
		this.position = 0;
		this.cold = 0;
		this.damage = 200;
		this._super(new LavaSprite());
	}
	, reinit: function()
	{
		this.name = 'Lava';
		this._super(new LavaSprite());
	}
	, steppedOn: function(stepper)
	{
		if(this.cold)
		{
			return;
		}

		if(stepper.fireDamage instanceof Function)
		{
			stepper.fireDamage(this.damage);
		}
		else if(stepper.damage instanceof Function)
		{
			stepper.damage(this.damage);
		}

		if(stepper instanceof IceBlock)
		{
			this.cold = 1;
			this.updateSprite();
		}
	}
	, updateSprite: function()
	{
		var selectedSprite = this.sprite.standing;

		if(this.cold)
		{
			selectedSprite = this.sprite.cold;
		}

		if(this.position == 1)
		{
			this.frames = selectedSprite.topLeft;
		}
		else if(this.position == 2)
		{
			this.frames = selectedSprite.top;
		}
		else if(this.position == 3)
		{
			this.frames = selectedSprite.topRight;
		}
		else if(this.position == 4)
		{
			this.frames = selectedSprite.left;
		}
		else if(this.position == 5)
		{
			this.frames = selectedSprite.right;
		}
		else if(this.position == 6)
		{
			this.frames = selectedSprite.bottomLeft;
		}
		else if(this.position == 7)
		{
			this.frames = selectedSprite.bottom;
		}
		else if(this.position == 8)
		{
			this.frames = selectedSprite.bottomRight;
		}
		else
		{
			this.frames = selectedSprite.south;
		}

		console.log(this.frames);
	}
});
var AbstractTriggerableAllAtOnce = TriggerableAllAtOnce.extend({
	init: function(direction)
	{
		this.reinit();
		this._super();
	}
	, reinit: function()
	{
		this.name = 'AbstractTriggerableAllAtOnce';
		this._super(new TriggerSprite());
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function()
	{

	}
});
var PolyWall = Triggerable.extend({
	init: function()
	{
		this.reinit();
		this.direction = 0;
		this.opened = false;
		this.breaking = false;
		this.children = [];
		this.hollowBox = null;
		this.hSprite = new BoxSprite;
		this.vSprite = new BoxesSprite;
		this._super(this.hSprite);
	}
	, reinit: function()
	{
		this.name = 'PolyWall';
		this.hSprite = new BoxSprite;
		this.vSprite = new BoxesSprite;
		this._super(this.hSprite);

		this.sprite = this.vSprite;
		this.preloadSprite();
		this.sprite = this.hSprite;
		this.opened = false;
	}
	, update: function()
	{
		if(this.direction % 2 && this.sprite !== this.vSprite)
		{
			this.sprite = this.vSprite;
		}

		if(!(this.direction % 2) && this.sprite !== this.hSprite)
		{
			this.sprite = this.hSprite;
		}

		this.frames = this.sprite.standard();

		this._super();

		var moving = false;

		for(var i in this.children)
		{
			if(this.children[i].stepping)
			{
				moving = true;
			}
		}

		if(this.stepping)
		{
			moving = true;
		}

		if(this.triggered && !moving)
		{
			this.opened = false;
		}

		if(this.triggered && !moving)
		{
			if(this.children.length)
			{
				for(var i in this.children)
				{
					if(this.children[i].x !== this.x
						|| this.children[i].y !== this.y
					){
						this.children[i].turn((this.direction+2)%4);
						this.children[i].step(6);
					}
					else
					{
						this.children[i].destroy(true);
						this.children.splice(i, 1);
					}
				}

				if(!this.children.length)
				{
					this.world.game.message.blit('Door opened.', 250, 'better');
				}
			}
		}

		if(!this.triggered && !this.opened)
		{
			for(var i in this.children)
			{
				this.children[i].destroy(true);
			}

			this.children = [];

			var stepX = 0;
			var stepY = 0;

			if(this.direction == this.RIGHT)
			{
				stepX				= 1;
			}
			else if(this.direction == this.DOWN)
			{
				stepY				= 1;
			}
			else if(this.direction == this.LEFT)
			{
				stepX				= -1;
			}
			else if(this.direction == this.UP)
			{
				stepY				= -1;
			}

			var spawnX = parseInt(this.x) + parseInt(stepX);
			var spawnY = parseInt(this.y) + parseInt(stepY);
			var hitWall = false;

			while(this.world && (this.world.canSpawn(spawnX, spawnY) || !hitWall))
			{
				var newBox;

				if(this.direction % 2)
				{
					var newBox = new Boxes();
				}
				else
				{
					newBox = new Box();
				}

				this.children.unshift(newBox);

				newBox.doNotStore = true;

				this.world.addObject(
					newBox
					, spawnX
					, spawnY
				);

				spawnX += stepX;
				spawnY += stepY;

				hitWall = false;

				if(!this.world.canSpawn(spawnX, spawnY))
				{
					if(blockers = this.world.getObjects(spawnX, spawnY))
					{
						for(var i in blockers)
						{
							if(blockers[i].damage
								&& blockers[i].damage instanceof Function
							){
								blockers[i].damage(10000, this);
							}
							else
							{
								blockers[i].push(10000);
							}
						}

						if(blockers[i] && (blockers[i].name == 'Box' || blockers[i].name == 'Boxes'))
						{
							hitWall = true;
						}

					}
					else
					{
						hitWall = true;
					}
				}
			}

			this.opened = true;
		}
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
});
function GasTrap()
{
	var actor		= new Actor(new NullSprite());

	for(var i in actor)
	{
		this[i]		= actor[i];
	}

	this._steppedOn	= this.steppedOn;
	this.steppedOn	= function()
	{
		/*
		this.world.game.stackState(
			'dialog'
			, {text: 'Lights out.'}
			, true
		);*/
/*
		this.world.viewport.overlay('#000', 0.5);
		this.world.viewport.fadeOverlay(50);
*/
		return true;
	}
}
var Button = StepTrigger.extend({
	init: function()
	{
		this.name = 'Button';
		this.reinit();
		this.origSprite = new ButtonSprite();
		this.otherSprite = new ButtonActivatedSprite();

		this._super(this.origSprite);
	}
	, reinit: function()
	{
		this.origSprite = new ButtonSprite();
		this.otherSprite = new ButtonActivatedSprite();

		this._super(this.origSprite);

		this.sprite = this.otherSprite;
		this.preloadSprite();
		this.sprite = this.origSprite;
	}
	, update: function()
	{
		this._super();

		if(this.triggered && this.sprite !== this.otherSprite)
		{
			this.sprite = this.otherSprite;
			this.preloadSprite();

			this.frames = this.sprite.standard();
		}
		else if(!this.triggered && this.sprite !== this.origSprite)
		{
			this.sprite = this.origSprite;
			this.preloadSprite();
		}

		this.frames = this.sprite.standard();
	}
});
var Corpse = DamageableBindable.extend({
	init: function(sprite, maxHealth, corpse)
	{
		this._super(sprite, maxHealth, corpse);
		this.name = 'Corpse';
		this.ignoreControl = true;
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy && this.lastDamagedBy.name)
		{
			this.world.game.message.blit('Corpse destroyed by a ' + this.lastDamagedBy.name + '.');
		}
		else
		{
			this.world.game.message.blit('Corpse destroyed.');
		}
	}
	, vacuumDamage: function()
	{
		
	}
	, destroy: function(clean)
	{
		if(this.master)
		{
			this.master.removeParty(this)
		}
		
		this._super(clean);
	}
});
var BarrelHole = FloorTrigger.extend({
	init: function(maxBarrels)
	{
		this.name = 'BarrelHole';
		this.barrel		= null;
		this.state		= 'closed';
		this.maxBarrels = maxBarrels;
		if(!this.maxBarrels)
		{
			this.maxBarrels = 0;
		}
		this.barrels	= 0;
		this.frameTimer	= 1;
		this._super(new BarrelHoleSprite());
		this.reinit();
		this.justFilled = 0;
	}
	, reinit: function()
	{
		this._super(new BarrelHoleSprite());
	}
	, update: function()
	{
		var animComplete = false;
		if(this.currentFrame == this.frames.length -1)
		{
			animComplete = true;
		}

		var coObjs = this.world.getObjects(this.x, this.y);

		this.barrel = null;

		for(var i in coObjs)
		{
			if(
				coObjs[i].destroy
				&& coObjs[i] instanceof Barrel
			){
				this.barrel = coObjs[i];
			}
		}

		if(this.state == 'closed' && animComplete)
		{
			this.frames = this.sprite.standing.south;
		}

		if(this.state == 'open' && animComplete)
		{
			this.frames = this.sprite.open.south;
		}

		if(this.state == 'open' && animComplete && !this.barrel )
		{
			this.frames = this.sprite.closing.south;
			this.state = 'closed';
		}

		if(this.state == 'closed' && this.barrel &&(
			this.maxBarrels == 0
			|| this.maxBarrels > this.barrels
		)){
			this.state = 'open';
			this.frames = this.sprite.opening.south;
		}

		if(this.state == 'open'
			&& this.barrel
			&& !this.barrel.heldBy
			&& this.barrel.stepTimer < 2
		){
			this.barrels++;

			if(this.maxBarrels && this.maxBarrels > 1)
			{
				this.world.game.message.blit(
					'Fuel port '
					+ this.barrels
					+ '/'
					+ this.maxBarrels
					+ ' filled...'
				);
			}

			this.barrel.destroy(true);
			this.barrel = null;
			this.state = 'closed';
			this.frames = this.sprite.closing.south;
		}

		if(this.maxBarrels
			&& (this.state == 'closed'
				&& this.maxBarrels <= this.barrels
			)
		){
			this.state = 'sealing';
			this.frames = this.sprite.sealing.south;
			animComplete = false;
		}

		if(this.state == 'sealing' && animComplete)
		{
			this.frames = this.sprite.sealed.south;
		}

		if(this.barrels >= this.maxBarrels)
		{
			if(this.justFilled == 0)
			{
				this.world.game.message.blit(
					'Fuel port filled. Activating!'
					, 250
					, 'good'
				);
			}

			if(!this.justFilled)
			{
				this.justFilled++;		
			}
			
			this.trigger();
		}

		this._super();
	}
});
var ExplosionNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/explosion.wav');
var Barrel = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new BarrelSprite, 99);
		this.lastCollide		= null;
		this.doDamage			= 1000;
		this.tileOffsetY		= -4;
	}
	, reinit: function()
	{
		this.name = 'Barrel';
		this._super(new BarrelSprite, 99);
		this.explosionNoise		= ExplosionNoise;
	}
	, update: function()
	{
		this._super();

		if(this.health <= 0)
		{
			this.world.viewport.overlay('#FFF', 1);
			this.world.viewport.fadeOverlay(8);
			if(!parseInt(localStorage.getItem('muted')))
			{
				this.explosionNoise.play();
				this.bumpNoise.play();
			}

			var tile = this.world.getTile(this.x, this.y);
			var tiles = [tile, tile.up(), tile.down()
				, tile.left(), tile.right()
				, tile.right().up(), tile.right().down()
				, tile.left().up(), tile.left().down()
			];

			for(var i in tiles)
			{
				var tileObjects = tiles[i].objects();

				for(var j in tileObjects)
				{
					if(tileObjects[j]
						&& tileObjects[j].explosionDamage
						&& tileObjects[j].explosionDamage instanceof Function
					){
						tileObjects[j].explosionDamage(this.doDamage, this);
					}
					else if(tileObjects[j]
						&& tileObjects[j].damage
						&& tileObjects[j].damage instanceof Function
					){
						tileObjects[j].damage(this.doDamage, this);
					}
				}
			}
		}
	}
	, destroy: function(peaceful)
	{
		this._super(peaceful);
		if(!peaceful)
		{
			this.world.addObject(
				new BlastMark
				, this.x
				, this.y
			);
		}
	}
	, collide: function(other)
	{
		this._super(other);
		if(other instanceof Projectile && this.cheesed)
		{
			other.destroy();
		}
	}
	, crush: function(other)
	{
		if(this.health < this.maxHealth && Barrel.warned < 3)
		{
			this.world.game.message.blit('Careful with those barrels...', 500, 'warning');
			Barrel.warned++;
		}
		
		//console.log('crush', other);
		this._super(other);
		this.damage(20, other);
	}
	, onStep: function()
	{
		if(this.cheesed)
		{
			this.damage(1);
		}

		return this._super();
	}
	, fireDamage: function(amount, other)
	{
		this.damage(amount*8, other);
	}
	, announceDeath: function(peaceful)
	{
		if(!peaceful)
		{
			this._super(peaceful);
		}
	}
});
Barrel.warned = 0;var Door = Actor.extend({
	init: function()
	{
		this.state = 'closed';
		this.reinit();
		this._super(new DoorSprite());
	}
	, reinit: function()
	{
		this._super(new DoorSprite());
	}
	, useFacing: function()
	{
		if(this.state == 'closed')
		{
			this.state = 'open';
			this.frames = this.sprite.open.south;
		}
		else if(this.state == 'open')
		{
			this.state = 'closed';
			this.frames = this.sprite.standing.south;
		}
	}
	, canBeSteppedOn: function()
	{
		return this.state == 'open';
	}
});
var PlayerClone = Player.extend({
	init: function(sprite)
	{
		this._super(sprite);
		this.name = 'PlayerClone';
		this.resumeControl = -1;
		//this.doNotStore = true;

		colorFunc = this.swapColors(
			(PlayerClone.cloneCount+0)%3
			, (PlayerClone.cloneCount+2)%3
			, (PlayerClone.cloneCount+1)%3
			, 3
		);

		var iv = 0.4, iv2 = 0.5;

		scaleColorFunc = this.scaleColors(
			1 + ((Math.random()-iv2)*iv)
			, 1 + ((Math.random()-iv2)*iv)
			, 1 + ((Math.random()-iv2)*iv)
			, 1
		);

		PlayerClone.cloneCount++;

		this.alterSprite(colorFunc);
		this.preloadSprite();
		//this.alterSprite(scaleColorFunc);
		this.preloadSprite();

		this.originalSprite = this.sprite.clone();

		// console.log(this.originalSprite);

		var corpse = this.corpse;

		while(corpse)
		{
			this.alterSprite.apply(corpse, [colorFunc]);
			corpse.preloadSprite();
			this.alterSprite.apply(corpse, [scaleColorFunc]);
			corpse.preloadSprite();
			corpse = corpse.corpse;
		}

		this.direction = this.SOUTH;
		this.hollow = false;
	}
	, reinit: function()
	{
		var prevSprite = this.sprite;
		this.sprite = new NullSprite();

		for(var i in prevSprite)
		{
			this.sprite = prevSprite[i];
		}
	}
	, update: function(input)
	{
		if(this.resumeControl === 0)
		{
			this.resumeControl = -1;
			this.hollow = false;
			this.ignoreControl = false;
		}
		else if(this.resumeControl > 0)
		{
			this.resumeControl--;
		}

		if(this.health < 0)
		{
			this.ignoreControl = true;
		}

		this._super(input, true);
	}
	, step: function(speed, masterStep)
	{
		if(!this.ignoreControl)
		{
			return this._super(speed);
		}
	}
	, turn: function(direction)
	{
		if(!this.ignoreControl)
		{
			this._super(direction);
		}
	}
	, crush: function(stepper)
	{
		if(stepper instanceof Player
			&& stepper !== this
			&& !(stepper instanceof PlayerClone)
		){
			this.direction = (stepper.direction+2)%4;
			this.hollow = true;

			for(var i in stepper.party)
			{
				stepper.party[i].ignoreControl = true;
				stepper.party[i].resumeControl = stepper.party[i].stepSpeed;
			}
		}
		this._super(stepper);
	}
	, steppedOn: function(stepper)
	{
		if(stepper instanceof Player
			&& stepper !== this
			&& !(stepper instanceof PlayerClone)
		){
			this._step(this.stepSpeed);
			this.hollow = false;
			this.ignoreControl = false;
		}
	}
	, canBeSteppedOn: function(stepper)
	{
		if(!(stepper instanceof Player))
		{
			return false;
		}
		return this.hollow;
	}
	, canSpawn: function()
	{
		return false;
	}
	, destroy: function(clean)
	{
		if(this.master)
		{
			if(this.corpse && !clean)
			{
				this.master.addParty(this.corpse);
			}
			
			this.master.removeParty(this)
		}
		
		this._super(clean);
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy.name)
		{
			this.world.game.message.blit('You killed a clone with a ' + this.lastDamagedBy.name, 350);
		}
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
			this.damage(10);
			if(this.health <= 0)
			{
				this.world.game.message.blit('A clone suffocated.', 350);
			}
			
			this.vacuumDamageTimer = this.vacuumDamageTimerMax;
			return;
		}

		this.world

		this.vacuumDamageTimer--;
	}
});
PlayerClone.cloneCount = 0;
var LaserBeam = Triggerable.extend({
	init: function(root)
	{
		this.damage = 200;
		this.child = null;
		this.isRoot = !root;
		this.rootObj = root
		this.reinit();
		this._super(new LaserBeamSprite());
	}
	, reinit: function()
	{
		this.name = 'LaserBeam';
		this._super(new LaserBeamSprite());
	}
	, update: function()
	{
		if(!this.triggered)
		{
			this.triggered = false;
		}

		this._super();

		if(!this.triggered && this.isRoot && this.child)
		{
			this.child.destroy(true);
			this.child = null;
		}

		if(!this.triggered && this.isRoot)
		{
			return;
		}

		var coObjs = this.world.getObjects(this.x, this.y);

		var stepX = 0;
		var stepY = 0;

		if(this.direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(this.direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(this.direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(this.direction == this.UP)
		{
			stepY				= -1;
		}

		var spawnX = parseInt(this.x) + parseInt(stepX);
		var spawnY = parseInt(this.y) + parseInt(stepY);

		if(this.world.canSpawn(spawnX, spawnY) && !this.child)
		{
			newBeam = new LaserBeam(this);

			this.child = newBeam;

			this.child.doNotStore = true;

			this.world.addObject(
				newBeam
				, spawnX
				, spawnY
			);

			this.child.update();
		}
		else if(!this.world.canSpawn(spawnX, spawnY) && this.child)
		{
			this.child.destroy(true);
			this.child = null;
		}
		else if(!this.world.canSpawn(spawnX, spawnY) && !this.child)
		{
			var blockers = this.world.getObjects(spawnX, spawnY);

			for(var i in blockers)
			{
				if(
					blockers[i].laserDamage
					&& blockers[i].laserDamage instanceof Function
				){
					blockers.laserDamage(this.damage);
				}
				else if(
					blockers[i].damage
					&& blockers[i].damage instanceof Function
				){
					blockers[i].damage(this.damage);
				}
			}
		}
		else if(this.child && this.child.i === null)
		{
			this.child.destroy(true);
			this.child = null;
		}
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		if(this.triggered || !this.isRoot)
		{
			this._super(context, x, y, xPos, yPos, size);
		}
	}
	, destroy: function(clean)
	{
		if(this.child)
		{
			this.child.destroy(clean);
		}
		this._super(clean);
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, canSpawn: function()
	{
		return true;
	}
	, announceDeath: function()
	{
		
	}
});
var Rock = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new RockSprite());
	}
	, reinit: function()
	{
		this.name = 'Rock';
		this._super(new RockSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return false;
	}
	, canSpawn: function()
	{
		return false;
	}
	, announceDeath: function()
	{
		
	}
});
var Health = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new HealthSprite());
	}
	, reinit: function()
	{
		this.name = 'Health';
		this._super(new RockSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return true;
	}
	, canSpawn: function()
	{
		return true;
	}
	, announceDeath: function()
	{
		
	}
});
var Wanderer = DamageableCharacter.extend({
	init: function(sprite, maxHealth)
	{
		this._super(sprite, maxHealth);
		this.corpse = new Corpse(
			new PlayerCorpseSprite()
			, 250
			, new BloodStain()
		);
	}

	, update: function()
	{
		this._super();

		if(!this.stepping)
		{
			if(!this.canStep())
			{
				if(this.backward)
				{
					this.turn(((this.direction-1) % 4));
				}
				else
				{
					this.turn(((this.direction+1) % 4));
				}

				if(!this.canStep())
				{
					this.turn(((this.direction+2) % 4));
					this.backward = 1;
				}

				return;
			}

			if(!this.step(this.stepSpeed) || Math.random() < 0.2)
			{
				this.turn((this.direction+1 % 4));
			}
		}
	}
});
var Sentinel = Wanderer.extend({
	init: function()
	{
		this._super(new SentinelSprite(), 1500);
		this.reinit();
	}
	, reinit: function()
	{
		this.sprite = new SentinelSprite();
		this.name = 'Sentinel';
		this.stepSpeed = 16;
		this.corpse = new Corpse(
			new SentinelCorpseSprite()
			, 10
			, new Explosion()
		);
	}
});var World = Class.extend({
	init: function()
	{
		this.tileSize;
		this.game;
		this.map					= new Map(this);
		this.mapSet					= new MapSet(this);
		this.worldWidth				= this.map.width;
		this.worldHeight			= this.map.height;
		this.objects                = [];
		this.stepMatrix				= [];
		this.addedTiles				= [];
		this.saveStateId			= null;
		this.saveStateTitle			= null;
	}

	, bindGameObject: function(game)
	{
		this.game				= game;
	}

	, getTile: function(x, y)
	{
		return new Tile(this, x, y);
	}

	, addObject: function(object, x, y)
	{
		if(!this.objects)
		{
			this.objects        = [];
		}

		if(!this.objects[x])
		{
			this.objects[x]     = [];
		}

		if(!this.objects[x][y])
		{
			this.objects[x][y]  = [];
		}

		this.objects[x][y].push(object);

		if(object)
		{
			object.bindWorld(this);
			var i = this.objects[x][y].length - 1;
			object.setPosition(x, y, i);
		}

		if(object instanceof PolyWall)
		{
			this.viewport.updateEarly(object);
		}

		return i;
	}

	, removeObject: function(x, y, i, leaveIntact)
	{
		var obj;

		if(this.objects[x]
		   && this.objects[x][y]
		   && this.objects[x][y][i]
		){
			obj = this.objects[x][y][i];

			this.objects[x][y].splice(i, 1);

			for(var j in this.objects[x][y])
			{
				this.objects[x][y][j].i = j;
			}
		}

		if(this.objects[x] && this.objects[x][y])
		{
			var reset = true;

			for(var oI in this.objects[x][y])
			{
				if(this.objects[x][y][oI])
				{
					reset = false;
				}
			}

			if(reset)
			{
				this.objects[x][y] = [];
			}
		}

		if(obj)
		{
			//object.world = undefined;
			obj.setPosition(x, y, null);
		}

		return obj;
	}

	, getObjects: function(x, y)
	{
		if(this.objects[x]
		   && this.objects[x][y]
		){
			return this.objects[x][y];
		}

		return false;
	}

	, populateObjects: function()
	{
		//console.log('POPULATE');

		for(var i in this.map.objects)
		{
			//console.log('populate', i);

			var coords = this.map.indexToCoords(i);

			for(var j in this.map.objects[i])
			{
				var obj = new this.map.objectPallet[
					this.map.objects[i][j]
				];

				this.addObject(
					obj
					, coords[0]
					, coords[1]
				);

				if(this.map.objectInits[i] && this.map.objectInits[i][j])
				{
					for(var k in this.map.objectInits[i][j])
					{
						//console.log('POP', k, this.map.objectInits[i][j][k]);

						if(this.map.objectInits[i][j][k] == parseInt(this.map.objectInits[i][j][k]))
						{
							this.map.objectInits[i][j][k] = parseInt(this.map.objectInits[i][j][k]);
						}

						//console.log('SETTING', k);

						obj[k] = this.map.objectInits[i][j][k];
					}

					//console.log('BEFORE SPRITE UPDATE');

					obj.updateSprite();

					//console.log('AFTER SPRITE UPDATE');
				}
			}
		}

		for(var i in this.map.objectTriggers)
		{
			for(var j in this.map.objectTriggers[i])
			{
				var sCoords = this.map.indexToCoords(i);

				var obj = this.getObjects(
					sCoords[0]
					, sCoords[1]
				)[parseInt(j)];

				var triggerRefs = this.map.getTriggers(obj);

				if(triggerRefs)
				{
					for(var k in triggerRefs)
					{
						//console.log(triggerRefs);

						var trigger = this.getObjects(
							triggerRefs[k].x
							, triggerRefs[k].y
						)[triggerRefs[k].i];

						//console.log(trigger);

						if(obj.triggers && trigger)
						{
							obj.triggers.push(trigger);
						}
					}
				}
			}
		}
	}

	, flushObjects: function(ignore)
	{
		for(var x in this.objects){
		for(var y in this.objects[x]){
		for(var i in this.objects[x][y]){
			var obj = this.removeObject(x, y, i);
			if(obj)
			{
				var ignored = false;
				for(var i in ignore)
				{
					if(obj.name == ignore[i])
					{
						ignored = TRUE;
					}
				}

				if(!ignored)
				{
					obj.destroy(true);
					obj.world = undefined;
				}
			}
		}}}

		this.objects = [];
	}

	, setTileSize: function(size)
	{
		this.tileSize           = size;
	}

	, flushAddedTiles: function()
	{
		this.addedTiles = [];
	}

	, addTile: function(x, y, frames, wall, replace)
	{
		if(!this.addedTiles[x])
		{
			this.addedTiles[x] = [];
		}

		if(!this.addedTiles[x][y])
		{
			this.addedTiles[x][y] = [];
		}

		var newIndex;

		if(replace === undefined)
		{
			this.addedTiles[x][y].push({
				frames: frames
				, wall: wall
			});

			newIndex = this.addedTiles[x][y].length -1;
		}
		else
		{
			newIndex = replace;

			this.addedTiles[x][y][replace] = {
				frames: frames
				, wall: wall
			};
		}

		this.viewport.forceTileUpdate(x,y);

		return {
			x: x
			, y: y
			, i: newIndex
		};
	}

	, removeTile: function(x, y, i)
	{
		if(this.addedTiles
			&& this.addedTiles[x]
			&& this.addedTiles[x][y]
			&& this.addedTiles[x][y][i]
		){
			this.addedTiles[x][y][i] = null;
			this.viewport.forceTileUpdate(x,y);
		}
	}

	, isWall: function(x, y)
	{
		return this.map.getWall(x, y);
	}

	, refreshStepMatrix: function()
	{
		this.stepMatrix			= [];
	}

	, requestStep: function(stepper, direction)
	{
		if(!this.stepMatrix[stepper.x])
		{
			this.stepMatrix[stepper.x] = [];
		}

		if(!this.stepMatrix[stepper.x][stepper.y])
		{
			this.stepMatrix[stepper.x][stepper.y] = [];
		}

		this.stepMatrix[stepper.x][stepper.y][stepper.i] = {
			stepper:		stepper
			, direction:	stepper.direction
		}
	}

	, processStepMatrix: function()
	{
		var complete = true;

		for(var xI in this.stepMatrix){
		for(var yI in this.stepMatrix[xI]){
		for(var iI in this.stepMatrix[xI][yI]){
			var stepX   = 0;
			var stepY   = 0;
			var canStep	= true;

			if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.RIGHT)
			{
				stepX				= 1;
			}
			else if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.DOWN)
			{
				stepY				= 1;
			}
			else if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.LEFT)
			{
				stepX				= -1;
			}
			else if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.UP)
			{
				stepY				= -1;
			}

			var objects = this.getObjects(
				parseInt(this.stepMatrix[xI][yI][iI].stepper.x)
					+ parseInt(stepX)
				, parseInt(this.stepMatrix[xI][yI][iI].stepper.y)
					+ parseInt(stepY)
			);

			for(var oI in objects)
			{
				if(objects[oI] && objects[oI].i !== null)
				{
					if(objects[oI].push(this.stepMatrix[xI][yI][iI].stepper))
					{
						complete = false;
					}
					else if(!objects[oI].canBeSteppedOn(this.stepMatrix[xI][yI][iI].stepper))
					{
						objects[oI].collide(this.stepMatrix[xI][yI][iI].stepper);
						this.stepMatrix[xI][yI][iI].stepper.collide(objects[oI]);
						canStep = false;
					}
				}
			}

			if(this.isWall(
				parseInt(this.stepMatrix[xI][yI][iI].stepper.x) + stepX
				, parseInt(this.stepMatrix[xI][yI][iI].stepper.y) + stepY)
			){
				canStep = false;
			}

			if(this.stepMatrix[xI][yI][iI].stepper.ghost)
			{
				canStep = true;
			}

			if(!canStep)
			{
				continue;
			}

			var obj = this.removeObject(
				this.stepMatrix[xI][yI][iI].stepper.x
				, this.stepMatrix[xI][yI][iI].stepper.y
				, this.stepMatrix[xI][yI][iI].stepper.i
			);

			if(obj)
			{
				obj.justStepped		= false;
				obj.stepping		= true;
				obj.stepTimer		= obj.stepSpeed;
				obj.stepTime		= obj.stepSpeed;
				obj.stepSpeed		= obj.stepSpeed;
			}

			if(obj && !canStep)
			{
				obj.i = this.addObject(
					obj
					, obj.x
					, obj.y
				);
			}
			else if(obj)
			{
				coObjs = this.getObjects(
					parseInt(obj.x) + parseInt(stepX)
					, parseInt(obj.y) + parseInt(stepY)
				);

				obj.i = this.addObject(
					obj
					, parseInt(obj.x) + parseInt(stepX)
					, parseInt(obj.y) + parseInt(stepY)
				);

				for(var j in coObjs)
				{
					if(coObjs[j] && coObjs[j].steppedOn &&  coObjs[j] !== obj)
					{
						coObjs[j].steppedOn(obj);
					}
				}

				obj.onStep();

				if(obj.holding)
				{
					obj.holding.stepSpeed = obj.stepSpeed;
					this.requestStep(obj.holding, obj.direction);
				}

				if(obj.direction == obj.RIGHT)
				{
					obj.drawOffsetX	= -1;
				}
				else if(obj.direction == obj.DOWN)
				{
					obj.drawOffsetY	= -1;
				}
				else if(obj.direction == obj.LEFT)
				{
					obj.drawOffsetX	= 1;
				}
				else if(obj.direction == obj.UP)
				{
					obj.drawOffsetY	= 1;
				}

				complete = false;

				delete this.stepMatrix[xI][yI][iI];
			}
		}}}

		return complete;
	}

	, stepMatrixContents: function()
	{
		var objects = [];
		for(var xI in this.stepMatrix){
		for(var yI in this.stepMatrix[xI]){
		for(var iI in this.stepMatrix[xI][yI]){
			if(this.stepMatrix[xI][yI][iI] && this.stepMatrix[xI][yI][iI].stepper)
			{
				objects.push(this.stepMatrix[xI][yI][iI].stepper);
			}
		}}}
		return objects;
	}

	, steppedOn: function(stepper, x, y, testCall)
	{
		if(this.objects[x] && this.objects[x][y])
		{
			for(var i in this.objects[x][y])
			{
				if(this.objects[x][y][i])
				{
					if(!this.objects[x][y][i].steppedOn(stepper, true))
					{
						return false;
					}

					if(stepper.holding === this.objects[x][y][i])
					{
						this.objects[x][y][i].turn(stepper.direction);
						return this.objects[x][y][i].canStep();
					}

					if(this.objects[x][y][i] && !this.objects[x][y][i].steppedOn(stepper, testCall))
					{
						return false;
					}
				}
			}
		}

		return !this.isWall(x, y) && !this.isWallTop(x, y);
	}

	, canSpawn: function(x,y)
	{
		if(this.objects[x] && this.objects[x][y])
		{
			for(var i in this.objects[x][y])
			{
				if(this.objects[x][y][i])
				{
					if(!this.objects[x][y][i].canSpawn())
					{
						return false;
					}
				}
			}
		}

		return !this.isWall(x, y);
	}

	, bindViewport: function(viewport)
	{
		this.viewport			= viewport;
	}

	, renderTile: function(context, x, y, xPos, yPos)
	{
		var text                = '(' + x + ', ' + y + ')';
		var viewport			= this.viewport;

		if(x > this.worldWidth
			|| y > this.worldHeight
			|| this.map.getTile(x, y) === undefined
			|| this.map.resolveTile(this.map.getTile(x, y)) === undefined
		){
			var tile = imageCache.loadImage(
				'/SeanMorris/ClonesNBarrels/Img/free/pit.png'
				, function()
				{
					viewport.forceBgUpdate();
				}
			);

			if(tile.complete)
			{
				context.drawImage(
					tile
					, xPos
					, yPos
					, this.tileSize
					, this.tileSize
				);
			}
		}
		else
		{
			var tile = imageCache.loadImage(
				this.map.resolveTile(
					this.map.getTile(x, y)
				)
				, function()
				{
					viewport.forceBgUpdate();
				}
			);

			if(tile.complete)
			{
				context.drawImage(
					tile
					, xPos
					, yPos
					, this.tileSize
					, this.tileSize
				);
			}
		}

		if(this.addedTiles[x]
			&& this.addedTiles[x][y]
		)
		{
			for(var i in this.addedTiles[x][y])
			{
				if(this.addedTiles[x][y][i]
					&& this.addedTiles[x][y][i].frames[0]
				){
					context.drawImage(
						imageCache.loadImage(
							this.addedTiles[x][y][i].frames[0]
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
		}
	}
	, getState: function()
	{
		this.mapSet.storeState();

		return {
			state: this.mapSet.mapStates
			, playerState: this.mapSet.playerState
			, partyState: this.mapSet.partyState
		};
	}
	, setState: function(state)
	{
		console.log("FULLSTATE", state);
		this.mapSet.mapStates = state.state;

		for(var map in this.mapSet.maps)
		{
			if(typeof this.mapSet.maps[map] !== 'string')
			{
				continue;
			}

			console.log('Setting map state for', map, this.mapSet.maps[map], this.mapSet.mapStates[map]);

			this.mapSet.loadState(map);
		}

		this.mapSet.loadState(this.mapSet.currentMap);

		this.mapSet.playerState = state.playerState;

		if(!this.viewport.actor)
		{
			this.viewport.actor;

			this.viewport.actor = new Player();
		}

		this.addObject(
			this.viewport.actor
			, this.viewport.actor.x
			, this.viewport.actor.y
		);
	}
});
var MapSet = Class.extend({
	init: function(world)
	{
		this.world = world;
		this.maps = {
			//basement: Basement001
			// basement: ''
			// , subBasement: '764C62D2C2C711E5B97E40167E9DAEB6'
			// , surface: '291E1412C2C711E5B97E40167E9DAEB6'
			// , 'Testing Ground A': '9E0AB0DCEFDC11E5A47640167E9DAEB6'

			'Testing Ground A': 'testing-ground-a.json' 
			, subBasement:      'sub-basement.json' 
			, basement:         'basement.json' 
			, surface:          'surface.json' 
		};

		this.mapStates = {};
		this.playerState = {map:null,x:0,y:0};

		this.startingMap = 'basement';
		this.currentMap = null;
	}
	, storeState: function()
	{
		if(!this.currentMap)
		{
			return this.mapStates;
		}

		console.log('STORING STATE FOR MAP', this.currentMap);
		var mainActor = this.world.viewport.actor;

		if(!mainActor || !mainActor instanceof Player)
		{
			mainActor = new Player();

			this.world.addObject(mainActor, this.playerState.x, this.playerState.y);

			this.world.viewport.actor = mainActor;
		}

		this.playerState.map = this.currentMap;
		this.playerState.x = mainActor.x;
		this.playerState.y = mainActor.y;

		this.partyState = {};

		if(mainActor.party)
		{
			for(var i in mainActor.party)
			{
				this.partyState[i] = {
					x: mainActor.party[i].x
					, y: mainActor.party[i].y
					, i: mainActor.party[i].i
				};
			}
		}

		if(this.currentMap)
		{
			this.mapStates[this.currentMap] = [];
		}

		for(var xI in this.world.objects){
		for(var yI in this.world.objects[xI]){
		for(var iI in this.world.objects[xI][yI]){

			/*console.log(
				this.world.objects[xI][yI][iI].name
				, this.world.objects[xI][yI][iI].x
				, this.world.objects[xI][yI][iI].y
			);*/

			if(
				this.world.objects[xI][yI][iI] === mainActor
				|| this.world.objects[xI][yI][iI].doNotStore
			){
				continue;
			}

			var object = this.world.objects[xI][yI][iI];
			var objectCopy = {};

			objectCopy.data = {};
			objectCopy.refs = {};
			objectCopy.refs.triggers = [];

			objectCopy.position = {};
			objectCopy.position.x = this.world.objects[xI][yI][iI].x;
			objectCopy.position.y = this.world.objects[xI][yI][iI].y;
			objectCopy.position.i = this.world.objects[xI][yI][iI].i;

			for(var prop in object)
			{
				if(!(object[prop] instanceof Function)
					&& !(object[prop] instanceof Class)
					&& !(object[prop] instanceof Audio)
					&& !(object[prop] instanceof Image)
					&& prop !== 'tileSet'
					&& prop !== 'triggers'
					&& prop !== 'child'
					&& prop !== 'children'
				){
					objectCopy.data[prop] = object[prop];
					//console.log(prop, object[prop], object[prop] instanceof Audio);
					//JSON.stringify(objectCopy);
				}
			}

			for(var c in this.world.map.objectPallet)
			{
				if(
					object instanceof this.world.map.objectPallet[c]
				){
					objectCopy.constructor = c;
				}
			}

			for(var t in object.triggers)
			{
				objectCopy.refs.triggers.push({
					x: object.triggers[t].x
					, y: object.triggers[t].y
					, i: object.triggers[t].i
				});
			}

			if(!this.mapStates[this.currentMap])
			{
				this.mapStates[this.currentMap] = [];
			}

			this.mapStates[this.currentMap].push(objectCopy);
		}}}

		return this.mapStates;
	}
	, loadState: function(map)
	{
		var addedObjects = [];

		if(this.mapStates[map])
		{
			// console.log(this.mapStates[map].publicId);

			var loc = window.location.pathname.split('/');

			console.log(loc);

			if(this.mapStates[map].publicId && loc.length > 2)
			{
				window.history.replaceState({} ,null, '/map/' + this.mapStates[map].publicId);
			}
			else
			{
				window.history.replaceState({} ,null, '/');
			}

			this.world.flushObjects();
			for(var object in this.mapStates[map])
			{
				var newObject = new this.world.map.objectPallet[
					this.mapStates[map][object].constructor
				];

				// console.log(this.mapStates[map][object]);

				if(newObject)
				{
					newObject.loadedData = this.mapStates[map][object];

					addedObjects.push(newObject);

					for(var p in newObject.loadedData.data)
					{
						// console.log(p, newObject[p], newObject.loadedData.data[p]);
						newObject[p] = newObject.loadedData.data[p];
					}

					/*
					console.log(
						newObject.name
						, this.mapStates[map][object].position.x
						, this.mapStates[map][object].position.y
					);
					*/

					newObject.reinit();

					this.world.addObject(
						newObject
						, this.mapStates[map][object].position.x
						, this.mapStates[map][object].position.y
					);

					newObject.loadedData = this.mapStates[map][object];
				}
			}

			for(var o in addedObjects)
			{
				if(addedObjects[o])
				{
					if(addedObjects[o] instanceof Projectile
						|| addedObjects[o] instanceof Angle
					){
						console.log(addedObjects[o]);
					}

					if(addedObjects[o].loadedData.refs.triggers[0])
					{
						// console.log(addedObjects[o].loadedData.refs.triggers[0]);
					}

					for(var t in addedObjects[o].loadedData.refs.triggers)
					{
						var trigger = this.world.getObjects(
							addedObjects[o].loadedData.refs.triggers[t].x
							, addedObjects[o].loadedData.refs.triggers[t].y
						)[addedObjects[o].loadedData.refs.triggers[t].i];

						//if(addedObjects[o].triggers && trigger)
						if(trigger)
						{
							addedObjects[o].triggers.push(trigger);
						}
					}
				}
			}
		}
	}
	, switchMap: function(map, x, y, ignoreState, quiet)
	{
		var mainActor = this.world.viewport.actor;

		if(!ignoreState)
		{
			this.storeState();
		}

		var mapData;

		if(typeof this.maps[map] !== 'undefined')
		{
			mapData = this.maps[map];
		}
		else
		{
			mapData = map;
		}

		console.log('Switching to map', mapData);

		if(typeof mapData !== 'object')
		{
			var loadMap = new MapStorable();
			loadMap.load(mapData);
			var publicId = mapData;
			mapData = JSON.parse(loadMap.mapdata);
			mapData.publicId = publicId;
			this.world.game.currentState.mapStorable = loadMap;
			this.maps[publicId] = mapData
		}
		else
		{
			this.world.game.currentState.mapStorable = null;
		}

		this.world.map.setData(
			JSON.stringify(mapData)
			//, ignoreState
		);

		console.log('SWITCHING TO MAP ', mapData.publicId);

		var loc = window.location.pathname.split('/');

		console.log(loc);

		if(mapData.publicId && loc.length > 2)
		{
			window.history.replaceState({} ,null, '/map/' + mapData.publicId);
		}
		else
		{
			window.history.replaceState({} ,null, '/');
		}

		if(ignoreState)
		{
			this.world.flushObjects();
		}

		if(mainActor)
		{
			this.world.removeObject(
				mainActor.x
				, mainActor.y
				, mainActor.i
			);
		}

		this.world.flushAddedTiles();

		this.loadState(map);

		if(x === undefined)
		{
			x = mapData.start[0];
		}

		if(y === undefined)
		{
			y = mapData.start[1];
		}

		this.world.refreshStepMatrix();

		if(!mainActor || mainActor.name !== 'Player')
		{
			mainActor = new Player();
		}

		if(mainActor && y !== undefined)
		{
			this.world.addObject(
				mainActor
				, x
				, y
			);
		}

		if(mainActor)
		{
			this.world.viewport.bindCamera(mainActor);
		}

		if(!quiet)
		{
			this.world.game.message.blit('Map: ' + mapData.title + '.');
		}

		this.currentMap = map;
	}
	, addMap: function(mapStorable)
	{
		this.maps[mapStorable.publicId] = JSON.parse(mapStorable.mapdata);
		this.maps[mapStorable.publicId].publicId = mapStorable.publicId;
	}
});
var Basement001 = {"title":"TechDemo_map_001","start":[10,4],"width":49,"height":49,"tiles":["3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","3","3","3","1","1","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","0","0","3","1","1","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","16","17","3","22","23","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","18","19","3","18","19","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","20","21","3","24","25","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","1","1","3","3","3","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","2","1","1","2","2","2","2","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","2","2","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2"],"walls":[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,false,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,false,0,0,false,0,0,0,true,true,0,0,0,0,false,false,true,true,true,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,true,true,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,false,false,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,false,false,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,false,0,0,true,true,0,0,0,0,false,false,true,false,false,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,false,false,true,true,true,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,false,false,false,true,true,0,0,0,0,false,false,true,false,false,true,true,true,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],"objects":[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["23"],null,null,null,null,[],null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],["1"],["23"],null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],[],[],[],[],[],[],[],[],null,[],[],null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],null,null,[],[],[],null,[],null,null,null,null,null,null,null,null,null,null,null,null,["12"],["6"],["6"],["6"],["6"],["6"],null,null,[],null,null,null,[],null,null,[],null,null,null,null,[],null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,["16"],["13"],["6"],["6"],["6"],["6"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],["6"],["6"],["6"],null,null,["15"],null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],["6"],["6"],null,null,["17","18"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],null,null,null,null,["2"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["5"],["5"],["5"],[],[],null,[],["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,[],null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,null,null,null,null,null,null,null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,["1"],null,null,null,null,null,null,null,[],["13"],["13"],["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],null,["11"],null,null,null,null,null,null,null,null,null,["15"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,null,null,null,null,null,null,null,null,["17","18"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],null,null,null,null,null,null,null,null,null,["19"],["19"],null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["5"],["5"],["12"],[],[],null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["19"],["19"],null,null,null,null,null,null,null,null,null,null,[],null,null,null,["9"],[],null,null,null,null,null,null,null,["6"],["6"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["6"],["8"],null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],["13"],["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],["11"],[],null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],["1"],["1"],null,[],[],[],null,null,null,null,[],[],[],null,null,null,null,null,null,null,null,null,null,["18"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["10"],["10"],["10"],["5"],["5"],["5"],["5"],["5"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],["1"],["1"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],["2"],["2"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["0"],null,null,null,null,null,null,["0"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["1"],["10"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["1"],["10"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["1"],["10"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["0"],null,null,null,["9"],null,null,["0"],null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],[],["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectInits":[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,[],null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],[null],null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[],[],[],[],[],[],[],[],null,[],[],null,null,null,null,null,null,null,null,null,[{"direction":3}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,[],[],[],null,[],null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":2}],[null],[null],[null],[null],[null],null,null,[],null,null,null,[],null,null,[],null,null,null,null,[],null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],null,null,[null],null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,null,[null,null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,null,[{"maxBarrels":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[],[],null,[],[{"direction":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,[],null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,[null],null,null,null,null,null,null,null,[],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],null,[null],null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,[null,null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,[{"toMap":"surface","toX":16,"toY":14}],[{"toMap":"surface","toX":17,"toY":14}],null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[],[],null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":0}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"toX":14,"toY":11,"toMap":"subBasement"}],[{"toX":15,"toY":11,"toMap":"subBasement"}],null,null,null,null,null,null,null,null,null,null,[],null,null,null,[{"direction":1}],[],null,null,null,null,null,null,null,[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[null],[],null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,[],[],[],null,null,null,null,[],[],[],null,null,null,null,null,null,null,null,null,null,[{"triggered":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],[{"maxBarrels":1}],[{"maxBarrels":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"angleDirection":0}],null,null,null,null,null,null,[{"angleDirection":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,[{"direction":0}],null,null,[{"angleDirection":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectTriggers":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":5,"y":6,"i":0}]],null,null,null,null,null,null,null,null,null,[[{"x":15,"y":4,"i":0},{"x":15,"y":5,"i":0},{"x":15,"y":6,"i":0},{"x":15,"y":7,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":5,"y":3,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":3,"y":6,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":3,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":21,"y":10,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":22,"y":10,"i":0},{"x":23,"y":11,"i":0},{"x":24,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":29,"y":12,"i":0},{"x":30,"y":12,"i":0},{"x":31,"y":12,"i":0},{"x":32,"y":12,"i":0},{"x":33,"y":12,"i":0},{"x":34,"y":12,"i":0},{"x":34,"y":12,"i":0},{"x":35,"y":12,"i":0},{"x":36,"y":12,"i":0},{"x":37,"y":12,"i":0},{"x":38,"y":12,"i":0},{"x":39,"y":12,"i":0},{"x":40,"y":12,"i":0},{"x":41,"y":12,"i":0},{"x":42,"y":12,"i":0},{"x":43,"y":12,"i":0},{"x":44,"y":12,"i":0},{"x":45,"y":12,"i":0},{"x":46,"y":12,"i":0},{"x":47,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null,[{"x":29,"y":11,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":17,"y":18,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":3,"y":13,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":16,"y":19,"i":0},{"x":17,"y":19,"i":0},{"x":18,"y":19,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":21,"i":0},{"x":16,"y":21,"i":0},{"x":17,"y":21,"i":0},{"x":18,"y":21,"i":0},{"x":19,"y":21,"i":0},{"x":20,"y":21,"i":0},{"x":21,"y":21,"i":0},{"x":22,"y":21,"i":0},{"x":23,"y":21,"i":0},{"x":24,"y":21,"i":0},{"x":25,"y":21,"i":0},{"x":26,"y":21,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null,[{"x":15,"y":20,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[]],null,null,null,null,null,[[{"x":3,"y":20,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":26,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":27,"i":0},{"x":16,"y":27,"i":0},{"x":17,"y":27,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":16,"y":35,"i":0},{"x":17,"y":35,"i":0},{"x":18,"y":35,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":26,"y":42,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":24,"y":43,"i":0},{"x":24,"y":42,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}// /home/sean/newninja/vendor/seanmorris/clonesnbarrels/asset/Js/World/Maps/basement_002.js
Basement001 = {"title":"TechDemo_map_001","start":[10,4],"width":49,"height":49,"tiles":["3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","3","3","3","1","1","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","0","0","3","1","1","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","16","17","3","22","23","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","18","19","3","18","19","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","20","21","3","24","25","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","3","1","1","3","3","3","3","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","2","1","1","2","2","2","2","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","2","2","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2"],"walls":[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,0,0,0,0,0,0,true,true,0,0,0,0,0,false,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,false,0,0,false,0,0,0,true,true,0,0,0,0,false,false,true,true,true,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,true,true,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,false,false,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,false,false,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,false,0,0,true,true,0,0,0,0,false,false,true,false,false,true,false,false,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,false,false,true,false,false,true,true,true,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,false,false,false,true,true,0,0,0,0,false,false,true,false,false,true,true,true,true,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,false,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],"objects":[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["23"],null,null,null,null,[],null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],["1"],["23"],null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],[],[],[],[],[],[],[],[],null,[],[],null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],null,null,[],[],[],null,[],null,null,null,null,null,null,null,null,null,null,null,null,["12"],["6"],["6"],["6"],["6"],["6"],null,null,[],null,null,null,[],null,null,[],null,null,null,null,[],null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,["16"],["13"],["6"],["6"],["6"],["6"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],["6"],["6"],["6"],null,null,["15"],null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],["6"],["6"],null,null,["17","18"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],null,null,null,null,["2"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["5"],["5"],["5"],[],[],null,[],["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,[],null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,null,null,null,null,null,null,null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,["1"],null,null,null,null,null,null,null,[],["13"],["13"],["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],null,["11"],null,null,null,null,null,null,null,null,null,["15"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["11"],null,null,null,null,null,null,null,null,null,["17","18"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],["17"],null,null,null,null,null,null,null,null,null,["19"],["19"],null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["5"],["5"],["12"],[],[],null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["19"],["19"],null,null,null,null,null,null,null,null,null,null,[],null,null,null,["9"],[],null,null,null,null,null,null,null,["6"],["6"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["6"],["8"],null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],["13"],["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],["11"],[],null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],["1"],["1"],null,[],[],[],null,null,null,null,[],[],[],null,null,null,null,null,null,null,null,null,null,["18"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["10"],["10"],["10"],["5"],["5"],["5"],["5"],["5"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],["1"],["1"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],["2"],["2"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["0"],null,null,null,null,null,null,["0"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["1"],["10"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["1"],["10"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["1"],["10"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["0"],null,null,null,["9"],null,null,["0"],null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],[],["16"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectInits":[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,[],null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],[null],[{"orange":"true"}],null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[],[],[],[],[],[],[],[],null,[],[],null,null,null,null,null,null,null,null,null,[{"direction":3}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,[],[],[],null,[],null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":2}],[null],[null],[null],[null],[null],null,null,[],null,null,null,[],null,null,[],null,null,null,null,[],null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],null,null,[null],null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,null,[null,null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,null,[{"maxBarrels":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[],[],null,[],[{"direction":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],null,null,null,null,null,[],null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,[null],null,null,null,null,null,null,null,[],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],null,[null],null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,[null,null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,[{"toMap":"surface","toX":16,"toY":14}],[{"toMap":"surface","toX":17,"toY":14}],null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[],[],null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":0}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"toX":14,"toY":11,"toMap":"subBasement"}],[{"toX":15,"toY":11,"toMap":"subBasement"}],null,null,null,null,null,null,null,null,null,null,[],null,null,null,[{"direction":1}],[],null,null,null,null,null,null,null,[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[null],[],null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,[],[],[],null,null,null,null,[],[],[],null,null,null,null,null,null,null,null,null,null,[{"triggered":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],[{"maxBarrels":1}],[{"maxBarrels":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"angleDirection":0}],null,null,null,null,null,null,[{"angleDirection":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,[{"direction":0}],null,null,[{"angleDirection":2}],null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectTriggers":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":5,"y":6,"i":0}]],null,null,null,null,null,null,null,null,null,[[{"x":15,"y":4,"i":0},{"x":15,"y":5,"i":0},{"x":15,"y":6,"i":0},{"x":15,"y":7,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":5,"y":3,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":3,"y":6,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":3,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":21,"y":10,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":22,"y":10,"i":0},{"x":23,"y":11,"i":0},{"x":24,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":29,"y":12,"i":0},{"x":30,"y":12,"i":0},{"x":31,"y":12,"i":0},{"x":32,"y":12,"i":0},{"x":33,"y":12,"i":0},{"x":34,"y":12,"i":0},{"x":34,"y":12,"i":0},{"x":35,"y":12,"i":0},{"x":36,"y":12,"i":0},{"x":37,"y":12,"i":0},{"x":38,"y":12,"i":0},{"x":39,"y":12,"i":0},{"x":40,"y":12,"i":0},{"x":41,"y":12,"i":0},{"x":42,"y":12,"i":0},{"x":43,"y":12,"i":0},{"x":44,"y":12,"i":0},{"x":45,"y":12,"i":0},{"x":46,"y":12,"i":0},{"x":47,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null,[{"x":29,"y":11,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":17,"y":18,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":3,"y":13,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":16,"y":19,"i":0},{"x":17,"y":19,"i":0},{"x":18,"y":19,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":21,"i":0},{"x":16,"y":21,"i":0},{"x":17,"y":21,"i":0},{"x":18,"y":21,"i":0},{"x":19,"y":21,"i":0},{"x":20,"y":21,"i":0},{"x":21,"y":21,"i":0},{"x":22,"y":21,"i":0},{"x":23,"y":21,"i":0},{"x":24,"y":21,"i":0},{"x":25,"y":21,"i":0},{"x":26,"y":21,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null,[{"x":15,"y":20,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[]],null,null,null,null,null,[[{"x":3,"y":20,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":26,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":15,"y":27,"i":0},{"x":16,"y":27,"i":0},{"x":17,"y":27,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":16,"y":35,"i":0},{"x":17,"y":35,"i":0},{"x":18,"y":35,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":26,"y":42,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":24,"y":43,"i":0},{"x":24,"y":42,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]};
var Basement002 = {"title":"TechDemo_map_003","start":[5,10],"width":32,"height":22,"tiles":["3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","3","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","0","0","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","16","17","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","18","19","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","20","21","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","3","1","1","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","2","1","1","2","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2","2"],"walls":[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,0,0,0,true,true,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,false,false,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,false,false,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,0,0,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,true,0,0,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],"objects":[[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["20"],["20"],["20"],["20"],["20"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["20"],["20"],["20"],["20"],["20"],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["20"],["20"],["20"],["20"],["20"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["21"],null,[],[],["20"],["20"],["20"],["20"],["20"],[],[],[],null,null,null,null,null,null,null,null,["22"],["22"],["22"],["22"],["22"],["22"],null,null,null,null,null,null,[],[],[],[],["20"],["20"],["20"],["20"],["20"],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],["20"],["20"],["20"],["20"],["20"],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],["20"],["20"],["20"],["20"],["20"],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],["20"],["20"],["20"],["20"],["20"],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["5"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],[],["19"],["19"],null,null,null,null,null,null,["12"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],["5"],null,null,null,[],[],null,null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,["16"],null,null,null,null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["2"],["13"],["2"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["1"],["1"],["1"],["1"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectInits":[[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[{"position":4}],[null],[null],[null],[{"position":5}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[{"position":4}],[null],[null],[null],[{"position":5}],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[{"position":4}],[null],[null],[null],[{"position":5}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,[],[],[{"position":4}],[null],[null],[null],[{"position":5}],[],[],[],null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],null,null,null,null,null,null,[],[],[],[],[{"position":4}],[null],[null],[null],[{"position":5}],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[{"position":4}],[null],[null],[null],[{"position":5}],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],[{"position":4}],[null],[null],[null],[{"position":5}],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],[{"position":4}],[null],[null],[null],[{"position":5}],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[],[{"toX":39,"toMap":"basement","toY":22}],[{"toMap":"basement","toX":40,"toY":22}],null,null,null,null,null,null,[{"direction":2}],[null],[null],[null],[null],[null],[null],[null],[null],null,null,null,[],[],null,null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"maxBarrels":1}],[null],[{"maxBarrels":1}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[null],[null],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectTriggers":[[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],[],[],[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],[],null,[],[],[],[],[],[],[],[],[],[],null,null,null,null,null,null,null,[[{"x":22,"y":11,"i":0},{"x":22,"y":13,"i":0},{"x":24,"y":13,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,[[{"x":23,"y":12,"i":0},{"x":23,"y":13,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,[],[],null,null,null,null,null,null,[],[],[],[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]};
var Surface001 = {"title":"TechDemo_map_002","start":[16,14],"width":49,"height":49,"tiles":["4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","3","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","2","2","2","2","2","2","2","2","2","2","2","2","2","3","3","3","3","3","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","2","2","2","2","2","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","3","22","23","3","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","3","18","19","3","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","3","24","25","3","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","3","3","3","3","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","2","2","2","2","1","1","1","1","1","1","1","1","1","1","1","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","1","1","1","1","1","1","1","1","1","1","1","1","1","3","3","3","3","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","3","3","3","3","3","3","3","3","3","3","3","3","3","3","1","3","2","2","2","1","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","2","2","2","2","2","2","2","2","2","2","2","2","2","2","1","2","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4","4"],"walls":[false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,true,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,true,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,true,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,true,true,true,true,false,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,true,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"objects":[[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,["13"],null,[],null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["13"],null,null,null,null,null,["13"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["19"],["19"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["16"],["15"],["15"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["16"],["15"],["15"],[],null,null,null,null,["12"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["12"],null,null,null,null,["6"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,["6"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectInits":[[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[],null,null,null,null,null,[{"triggered":1}],null,[],null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"toX":36,"toY":22,"toMap":"basement"}],[{"toY":22,"toMap":"basement","toX":37}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[{"inverse":1}],[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],[{"inverse":1}],[null],[],null,null,null,null,[{"direction":3}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[{"direction":3}],null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[null],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],"objectTriggers":[[],[],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":23,"y":12,"i":0},{"x":29,"y":11,"i":0},{"x":29,"y":12,"i":0}]],null,null,null,null,null,[[{"x":23,"y":11,"i":0},{"x":23,"y":12,"i":0},{"x":29,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":23,"y":11,"i":0},{"x":29,"y":11,"i":0},{"x":29,"y":12,"i":0}]],null,null,null,null,null,[[{"x":29,"y":11,"i":0},{"x":23,"y":11,"i":0},{"x":23,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":28,"y":17,"i":0},{"x":29,"y":17,"i":0}]],[[{"x":29,"y":12,"i":0},{"x":23,"y":11,"i":0}]],[[{"x":29,"y":11,"i":0},{"x":23,"y":12,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":23,"y":18,"i":0},{"x":24,"y":18,"i":0}]],[[{"x":23,"y":12,"i":0},{"x":29,"y":11,"i":0}]],[[{"x":23,"y":11,"i":0},{"x":29,"y":12,"i":0}]],null,null,null,null,null,[[{"x":27,"y":17,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[[{"x":22,"y":18,"i":0}]],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]};
function Tile(world, x, y)
{
	this.world	= world;
	this.x		= x;
	this.y		= y;

	this.right = function()
	{
		return this.world.getTile(this.x+1, this.y);
	}

	this.down = function()
	{
		return this.world.getTile(this.x, this.y+1);
	}

	this.left = function()
	{
		return this.world.getTile(this.x-1, this.y);
	}

	this.up = function()
	{
		return this.world.getTile(this.x, this.y-1);
	}

	this.objects = function()
	{
		return this.world.getObjects(this.x, this.y);
	}

	this.addObject = function(object)
	{
		return this.world.addObject(object,this.x,this.y);
	}

	this.removeObject = function(i)
	{
		return this.world.removeObject(this.x,this.y,i);
	}

	this.vacuumDamage = function(object)
	{
		if(object.vacuumDamage && object.vacuumDamage instanceof Function)
		{
			object.vacuumDamage(5);
		}
	}
}
var Map = Class.extend({
	init: function(world)
	{
		this.title = 'StandardMap';
		this.world = world;
		this.width	= 7;
		this.height	= 7;
		this.start = [2,2];

		this.tilePallet = [
			'sprite:pit.png'
			, 'sprite:floorTile.png'
			, 'sprite:box_face.png'
			, 'sprite:boxes_top.png'
			, 'sprite:pluto_ground.png'
			, 'sprite:pluto_ground_cracked.png'
			, 'sprite:pluto_crater.png'
			, 'sprite:pluto_crater_top_left.png'
			, 'sprite:pluto_crater_top_center.png'
			, 'sprite:pluto_crater_top_right.png'
			, 'sprite:pluto_crater_middle_left.png'
			, 'sprite:pluto_crater_middle_center.png'
			, 'sprite:pluto_crater_middle_right.png'
			, 'sprite:pluto_crater_bottom_left.png'
			, 'sprite:pluto_crater_bottom_center.png'
			, 'sprite:pluto_crater_bottom_right.png'
			, 'sprite:stairs_top_left.png'
			, 'sprite:stairs_top_right.png'
			, 'sprite:stairs_middle_left.png'
			, 'sprite:stairs_middle_right.png'
			, 'sprite:stairs_bottom_left.png'
			, 'sprite:stairs_bottom_right.png'
			, 'sprite:stairs_down_top_left.png'
			, 'sprite:stairs_down_top_right.png'
			, 'sprite:stairs_down_bottom_left.png'
			, 'sprite:stairs_down_bottom_right.png'
			, 'sprite:rock_1_surface.png'
			, 'sprite:rock_2_surface.png'
			, 'sprite:rock_3_surface.png'
			, 'sprite:rock_4_surface.png'
		];

		this.objectPallet = [
			Angle
			, Barrel
			, BarrelHole
			, BlastMark
			, BloodStain
			, Box
			, Boxes
			, Cheese
			, CloneMachine
			, PlasmaBall
			, WoodBox
			, Sandbag
			, PolyWall
			, Button
			, Pit
			, AbstractTriggerableAny
			, AbstractTriggerableAllAtOnce
			, Barrier
			, LaserBeam
			, Warp
			, Lava
			, Bubble
			, IceBlock
			, Portal
			, Door
			, Rock
			, Health
			, Sentinel
			, Explosion
		];

		this.tileEffectPallet = [
			null
			, 'vacuumDamage'
		];

		this.tiles = [
			2, 2, 2, 2, 2, 2, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 2, 2, 2, 2, 2, 2
		];

		this.tiles = [
			4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
		];

		this.walls = [
			1, 1, 1, 1, 1, 1, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 1, 1, 1, 1, 1, 1
		];

		this.walls = [
			0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
		];

		this.objects = [
			null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null
		];

		this.objectInits = [
			null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null
		];

		this.objectTriggers = [
			null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null
		];

		this.tileEffects = [
			0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
		];
	}
	, getData: function()
	{
		return JSON.stringify({
			title: this.title
			, start: this.start
			, width: this.width
			, height: this.height
			, tiles: this.tiles
			, walls: this.walls
			, objects: this.objects
			, objectInits: this.objectInits
			, objectTriggers: this.objectTriggers
			, tileEffects: this.tileEffects
		});
	}
	, setData: function(string, preventReset)
	{
		var obj = JSON.parse(string);

		this.title	= obj.title;
		this.start	= obj.start;
		this.width	= obj.width;
		this.height	= obj.height;
		this.tiles	= obj.tiles;
		this.walls	= obj.walls;
		this.objects	=	obj.objects;
		this.objectInits	= obj.objectInits;
		this.objectTriggers	= obj.objectTriggers;
		this.tileEffects	= obj.tileEffects;

		this.world.worldWidth = this.width;
		this.world.worldHeight = this.height;
		
		/*
		if(preventReset)
		{
			for(var i in obj.objects)
			{
				if(!obj.objects[i])
				{
					continue;
				}

				for(var j in obj.objects[i])
				{
					if(!obj.objects[i][j])
					{
						continue;
					}

					this.world.addObject(
						obj.objects[i][j]
						, obj.objects[i][j].x
						, obj.objects[i][j].y
					);
				}
			}
			return;
		}
		*/
		
		this.refreshObjects(preventReset);
	}
	, isTileOnMap: function(x, y)
	{
		if(x >= this.width
			|| y >= this.height
			|| x < 0
			|| y< 0
		){
			return false;
		}

		return true;
	}
	, refreshObjects: function(preventReset)
	{
		var mainActor = this.world.viewport.actor;

		this.world.flushObjects();
		this.world.populateObjects();

		this.world.viewport.forceBgUpdate();

		this.world.addObject(
			mainActor
			, this.start[0]
			, this.start[1]
		);

		this.world.viewport.bindCamera(mainActor);
		this.world.worldWidth = this.width;
		this.world.worldHeight = this.height;

		this.world.viewport.forceBgUpdate();
	}
	, setWidth: function(width, newTile)
	{
		console.log('W:', newTile);

		if(newTile === null)
		{
			newTile = 0;
		}
		for(var i = 0; i < this.height; i++)
		{
			if(this.width > width)
			{
				this.tiles.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.objects.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.objectInits.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.objectTriggers.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.walls.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.tileEffects.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

			}
			else if(this.width < width)
			{
				for(var j = 0; j < width-this.width; j++)
				{
					console.log('w:', newTile);
					this.tiles.splice(
						this.width + (width * i)
						, 0
						, newTile
					);

					this.objects.splice(
						this.width + (width * i)
						, 0
						, null
					);

					this.objectInits.splice(
						this.width + (width * i)
						, 0
						, null
					);

					this.objectTriggers.splice(
						this.width + (width * i)
						, 0
						, null
					);

					this.walls.splice(
						this.width + (width * i)
						, 0
						, 0
					);

					this.tileEffects.splice(
						this.width + (width * i)
						, 0
						, 0
					);
				}
			}
		}

		this.width = width;
		this.refreshObjects();
	}
	, setHeight: function(height, newTile)
	{
		console.log('H:', newTile);

		if(newTile === null)
		{
			newTile = 0;
		}

		if(this.height < height)
		{
			var newTiles = (height - this.height) * this.width;
			for(var i = 0; i < newTiles; i++)
			{
				this.tiles.push(newTile);
				this.objects.push(null);
				this.objectInits.push(null);
				this.objectTriggers.push(null);
				this.walls.push(0);
				this.tileEffects.push(0);
			}
		}
		else if(this.height > height)
		{
			this.tiles = this.tiles.slice(0, height * this.width);
			this.objects = this.objects.slice(0, height * this.width);
			this.objectInits = this.objectInits.slice(0, height * this.width);
			this.objectTriggers = this.objectInits.slice(0, height * this.width);
			this.walls = this.walls.slice(0, height * this.width);
			this.tileEffects = this.tileEffects.slice(0, height * this.width);
		}

		this.height = height;
		this.refreshObjects();
	}
	, getTile: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			return this.tiles[this.coordsToIndex(x, y)];
		}

		return 0;
	}
	, getTileEffect: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			if(this.tileEffects && this.tileEffects[this.coordsToIndex(x, y)] !== undefined)
			{
				return this.tileEffects[this.coordsToIndex(x, y)];
			}
			
			return 0;
		}

		return 0;
	}
	, setTileEffect: function(effect, x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			if(this.tileEffects && this.tileEffects[this.coordsToIndex(x, y)] !== undefined)
			{
				this.tileEffects[this.coordsToIndex(x, y)] = effect;
			}
		}
	}
	, setTile: function(t, x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			this.tiles[this.coordsToIndex(x, y)] = t;
		}
	}
	, getWall: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			return this.walls[this.coordsToIndex(x, y)];
		}

		return true;
	}
	, setWall: function(w, x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			this.walls[this.coordsToIndex(x, y)] = !!w;
		}
	}
	, addObject: function(o, x, y, init)
	{
		if(this.objects[this.coordsToIndex(x,y)])
		{
			this.objects[this.coordsToIndex(x,y)].push(o);
			this.objectInits[this.coordsToIndex(x,y)].push(init);
		}
		else
		{
			this.objects[this.coordsToIndex(x,y)] = [o];
			this.objectInits[this.coordsToIndex(x,y)] = [init];
		}
	}
	, getObjects: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			return this.objects[this.coordsToIndex(x,y)];
		}

		return true;
	}
	, getObjectInits: function(x, y)
	{
		console.log('getObjectInits');
		if(this.isTileOnMap(x, y))
		{
			return this.objectInits[this.coordsToIndex(x,y)];
		}

		return true;
	}
	, setObjectInit: function(x, y, i, init)
	{
		if(this.isTileOnMap(x, y))
		{
			this.objectInits[this.coordsToIndex(x,y)][i] = init;
		}
	}
	, appendObjectInit: function(x, y, i, initKey, initVal)
	{
		console.log(x, y, i, initKey, initVal);
		if(this.isTileOnMap(x, y))
		{
			if(!this.objectInits[this.coordsToIndex(x,y)])
			{
				this.objectInits[this.coordsToIndex(x,y)] = [];
			}

			if(!this.objectInits[this.coordsToIndex(x,y)][i])
			{
				this.objectInits[this.coordsToIndex(x,y)][i] = {};
			}

			this.objectInits[this.coordsToIndex(x,y)][i][initKey] = initVal;
		}
	}
	, addTrigger: function(subject, trigger)
	{
		var objectIndex = this.coordsToIndex(subject.x,subject.y);

		if(!this.objectTriggers[this.coordsToIndex(subject.x,subject.y)])
		{
			this.objectTriggers[objectIndex] = [];
		}

		if(!this.objectTriggers[objectIndex][subject.i])
		{
			this.objectTriggers[objectIndex][subject.i] = [];
		}

		this.objectTriggers[objectIndex][subject.i].push({
			x: trigger.x
			, y: trigger.y
			, i: trigger.i
		});
	}
	, removeTrigger: function(subject, trigger)
	{
		var objectIndex = this.coordsToIndex(subject.x,subject.y);

		if(this.objectTriggers[objectIndex]
			&& this.objectTriggers[objectIndex][subject.i]
		){
			this.objectTriggers[objectIndex][subject.i].splice(trigger.i);
		}
	}
	, getTriggers: function(subject)
	{
		if(!subject)
		{
			return undefined;
		}

		var objectIndex = this.coordsToIndex(subject.x,subject.y);

		if(!this.objectTriggers)
		{
			this.objectTriggers = [];
		}

		if(!this.objectTriggers[this.coordsToIndex(subject.x,subject.y)])
		{
			return undefined;
		}

		return this.objectTriggers[objectIndex][subject.i];
	}
	, removeObject: function(x, y, i)
	{
		if(this.objects[this.coordsToIndex(x, y)])
		{
			var obj = this.objects[this.coordsToIndex(x, y)].splice(i, 1);
			var objInit = this.objectInits[this.coordsToIndex(x, y)].splice(i, 1);

			return obj;
		}

		return undefined;
	}
	, resolveTile: function(t)
	{
		return this.tilePallet[t];
	}
	, indexToCoords: function(i)
	{
		return [
			parseInt(i) % this.width
			, Math.floor(parseInt(i)/this.width)
		]
	}
	, coordsToIndex: function(x, y)
	{
		return (parseInt(y)*this.width)+parseInt(x);
	}
});
var g;

$(document).ready(
	function()
	{
		var canvas	= $('canvas');
		g = new Game(canvas);
	}
);
