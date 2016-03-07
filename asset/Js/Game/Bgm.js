var Bgm = Class.extend({
	init: function(game)
	{
		this.game = game;
		this.playlist = [
			'/SeanMorris/ClonesNBarrels/Sound/645536_-Pixelated-.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/613426_Destractor.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/649164_Cybernetic-Lifeform.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/530471_Coins-8Bit.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/631905_Somuchfun.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/642215_Return-to-Warp.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/533768_Bytestep.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/514068_N3Z-3---8-bit-crush.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/651983_Motions.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/648035_Milky-Ways-Redux.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/557827_Retro-Hearts-8th-Sense-Rem.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/632595_Astronomixel.mp3'
		];

		this.playlistMeta = [
			'-Pixelated- by Spitfire5570'
			, 'Destractor by neocrey'
			, 'Cybernetic Lifeform by MaliciousWyvern'
			//, '530471_Coins-8Bit'
			, '631905_Somuchfun'
			, 'Return To Warp by CherryBerryGangsta'
			, 'Bytestep by conorstrejcek'
			, '8-Bit Crush by NZ3'
			, 'Motions by midimachine'
			, 'Milky Ways Redux by Holyyeah'
			, 'Retro Hearts (8th Sense Remix) by Skullbeatz'
			//, '632595_Astronomixel'
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
});