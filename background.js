var channels_to_check = ["day9tv"];
var update_interval_ms=30000;
var channels_state = new Object();

json=function(url,callback) {
	var xmlHttpRequst = new XMLHttpRequest();
	if(xmlHttpRequst != false) {
		xmlHttpRequst.open("GET", url, true);
		xmlHttpRequst.onload = function() {
			callback(JSON.parse(xmlHttpRequst.responseText));
		}
		xmlHttpRequst.send(null);
	}
};

get_twitch_channel_state = function(channel,state_cb) {
	url="http://api.justin.tv/api/stream/list.json?channel="+channel;
	json(url,function(data) {
		is_online=!(data.length<1);
		state_cb(channel,is_online,is_online ? data[0].title : 0);
	});
};

loop = function(start, end, body) {
	for(var i = start; i != end; i += 1) {
		body(i);
	}
};

each_channel = function(body) {
	loop(0,channels_to_check.length,body);
};

twitch_update_channels_state=function() {	
	each_channel(function(i) { 
		channel = channels_to_check[i];
		get_twitch_channel_state(channel,function(channel,is_online,data) {
			on_update_channel_state(channels_to_check[i],is_online);
		});
	});
};

on_update_channel_state = function (channel,new_state) {
		old_state = channels_state[channel];
		if(old_state != new_state){
			on_channel_state_changed(channel,new_state);
		}
		channels_state[channel] = new_state;
};

on_channel_state_changed = function (channel,is_online) {
		if(is_online==1) {
			on_channel_gone_live(channel);
		}
};

on_channel_gone_live = function (channel) {
		url=get_channel_url(channel);
		open_tab(url);
};

get_channel_url = function (channel) {
	return "http://www.twitch.tv/"+channel;
};

open_tab = function (url) {
	chrome.windows.create({'url':url});
};

main = function() {
	each_channel(function(i) {
		channels_state[channels_to_check[i]]=0;
	});
	twitch_update_channels_state();
	setInterval(twitch_update_channels_state, update_interval_ms);
};

main();



