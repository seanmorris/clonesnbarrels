var Bgm = Class.extend({
	init: function()
	{
		this.playlist = [
			'/SeanMorris/ClonesNBarrels/Sound/642215_Return-to-Warp.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/533768_Bytestep.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/514068_N3Z-3---8-bit-crush.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/651983_Motions.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/648035_Milky-Ways-Redux.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/557827_Retro-Hearts-8th-Sense-Rem.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/632595_Astronomixel.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/645536_-Pixelated-.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/613426_Destractor.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/649164_Cybernetic-Lifeform.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/530471_Coins-8Bit.mp3'
			//, '/SeanMorris/ClonesNBarrels/Sound/631905_Somuchfun.mp3'
		];

		this.playheader = 0;

		this.audio = null;
	}
	, play: function()
	{
		if(this.audio)
		{
			if(this.audio.paused)
			{
				this.audio.play();
			}
			else
			{
				this.audio.pause();
			}
		}
		else
		{
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

var bgmSingleton = new Bgm;

var bgmPlayer = function() {
	return bgmSingleton;
};