
var utils = function() {
	var utils = {};

	function get_func(obj, cmd) {
		//console.log('get_func', obj, cmd);
		if (typeof(cmd) == "string") {cmd = cmd.split(".");}
		if (cmd.length == 1) {return obj[cmd.shift()];}
		if (cmd.length > 1) {
			var next_cmd = cmd.shift();
			var next_obj = obj[next_cmd];
			if (typeof(next_obj) == "undefined") {
				console.error(""+obj+" has no attribute "+next_cmd);
				return function(){};
			}
			return get_func(next_obj, cmd);}
		console.error('What?');
		return function(){};
	}
	utils.get_func = get_func;
	
	utils.is_image = function(src) {
		return src && src.match(/\.(jpg|png|bmp|gif|jpeg|svg|tiff)$/);
	}
	utils.is_video = function(src) {
		return src && src.match(/\.(mp4|avi|mov|mkv|ogm|3gp)$/);
	}

	return utils;
}();
	
var socket = WebSocketReconnect({
	onopen: function() {},
	onmessage: function(data) {
		//console.log('message', data);
		if (_.has(data, 'func')) {
			utils.get_func(window, data.func)(data);
		}
	}
});


var trigger = {
	precache: function(data) {
		//console.log('precache', data);
		if (utils.is_image(data.src)) {
			var img = new Image();
			img.src = data.src;
		}
		if (utils.is_video(data.src)) {
			load_video(data.src);
		}
	},
	start: function(data) {
		//console.log('start', data);
		if (utils.is_image(data.src)) {
			$('#screen').html("<img src='SRC'>".replace('SRC', data.src));
		}
		if (utils.is_video(data.src)) {
			load_video(data.src, true);
		}
	},
	stop: function(data) {
		console.log('stop');
	}
};


(function(external, options){
	options = _.extend({
		selector_holder: '#fullscreen_video',
	}, options);

	function _get_video_element(create, selector_holder, onCreateVideo) {
		if (!selector_holder) {selector_holder = options.selector_holder;}
		var selector_video = selector_holder+' video';
		var video = $(selector_video).get(0);
		if (!video && create) {
			$(selector_holder).append('<video></video>');
			video = $(selector_video).get(0);
			onCreateVideo(video);
		}
		return video || {};
	}

	function load_video(src, play, event_listeners, selector_holder) {
		if (!event_listeners) {event_listeners = {};}
		if (!selector_holder) {selector_holder = options.selector_holder;}
		if (typeof(play) != "boolean") {play = false;}

		$(selector_holder+' :not(video)').remove();
		if (!src) {
			$(selector_holder).empty();
			return;
		}

		var video = _get_video_element(true, selector_holder, function(video){
			_.each(event_listeners, function(key, value, dict){
				video.addEventListener(key, value);
			});
		});

		video.loop = false;
		video.volume = 1.0;
		video.controls = false;
		video.preload = "auto";
		video.autoplay = play;
		console.log(video.currentSrc, src);
		if (video.currentSrc.indexOf(src) > -1) {
			video.pause();
			video.currentTime = 0;
		}
		else {
			video.src = src;
			video.load();
		}
		if (play) {
			video.play();
		}
	}

	external.load_video = load_video;

}(window, {
	'selector_holder': '#screen'
}));