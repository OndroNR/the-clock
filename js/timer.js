Array.prototype.removeByValue = function(val) {
    for(var i=0; i<this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}

function supports_html5_storage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

var timers;

function storeData()
{
	if (supports_html5_storage())
	{
		localStorage["timers"] = $.toJSON(timers);
		localStorage["timersHtml"] = $.toJSON({html: $("#timers").html()});
	}
}

function restoreHtml()
{
	if (supports_html5_storage())
	{
		if (localStorage.getItem("timersHtml"))
		{
			if (localStorage["timersHtml"] != undefined)
			{
				// restore html
				$("#timers").html( $.evalJSON(localStorage["timersHtml"]).html );
				
				// restore state of elements
				$(".toolbar *").animate({opacity:1});
				$(".toolbar").animate({opacity:0});
				$("#timers > div").animate({opacity:1});

				// restore toolbar icons visibility
				for (timer in timers)
				{
					var t = timers[timer];

					if (t.running)
					{
						$("#timer"+t.id+" .toolbar .play").hide();
						$("#timer"+t.id+" .toolbar .pause").show();
					}
					else
					{
						$("#timer"+t.id+" .toolbar .pause").hide();
						$("#timer"+t.id+" .toolbar .play").show();
					}
				}
			}
		}
	}
}


// tick
function updateClock()
{
	var currentTime = new Date();

	// clock
	var currentHours = currentTime.getHours();
	var currentMinutes = currentTime.getMinutes();
	var currentSeconds = currentTime.getSeconds();

	// Pad the minutes and seconds with leading zeros, if required
	currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
	currentMinutes = ( currentMinutes < 10 ? "0" : "" ) + currentMinutes;
	currentSeconds = ( currentSeconds < 10 ? "0" : "" ) + currentSeconds;


	// Update the time display
	$("#clock span").html(currentHours + ":" + currentMinutes + ":" + currentSeconds);


	// update timers
	for (timer in timers)
	{
		var t = timers[timer];

		if (t.running)
		{
			var diff = Math.floor((  (new Date()).getTime() - t.start  ) / 1000);
		}
		else
		{
			var diff = 0;
		}

		var totalSeconds = Math.floor( diff ) + t.offset;
		var hours = Math.floor(totalSeconds / 3600);
		totalSeconds = totalSeconds -  hours * 3600;
		var minutes = Math.floor(totalSeconds / 60);
		seconds = totalSeconds -  minutes * 60;
		$("#timer"+t.id+" span").html(  hours + ":" + minutes + ":" + seconds);
	}
}

$(function() {

	// restore state
	if (supports_html5_storage())
	{
		if (localStorage["timers"] != undefined)
			timers = $.evalJSON(localStorage["timers"]);
	}

	if (typeof timers != "object")
		timers = [];
		
	restoreHtml();

	updateClock();
	setInterval('updateClock()', 250 );
		
	$("#addTimer").click(function() {
		var timer = {
			id: (new Date()).getTime(),
			start: (new Date()).getTime(),
			offset: 0,
			running: true,
		};

		var toolbar = "<div class=\"toolbar\"><div class=\"pause\" title=\"Pause timer\"></div><div class=\"play\" title=\"Resume timer\"></div><div class=\"delete\" title=\"Remove timer\"></div></div>";
		
		$("#timers").append("<div id=\"timer" + timer.id + "\" data-tid=\"" + timer.id + "\" class=\"clockBlue timer\"><span></span>"+toolbar+"</div>");
		$("#timer"+timer.id).hide().fadeIn();

		timers.push(timer);
		updateClock();
		storeData();
	});

	// toolbar icons handlers
	$("#timers").delegate("div.timer .toolbar .pause", "click", function() {
		var timerId = $(this).parent().parent().attr("data-tid");
		// find timer
		for (timer in timers)
		{
			var t = timers[timer];
			if (t.id == timerId)
			{
				if (t.running)
				{
					t.running = false;
					t.offset += Math.floor(((new Date()).getTime() - t.start)/1000); // in fact store displayed time in this moment
				}
			}
		}
		$(this).fadeOut("quick"); // pause button
		$(this).parent().children(".play").fadeIn("quick"); // play button
		$(this).parent().parent().addClass("paused");
		storeData();
	});

	$("#timers").delegate("div.timer .toolbar .play", "click", function() {
		var timerId = $(this).parent().parent().attr("data-tid");
		for (timer in timers)
		{
			var t = timers[timer];
			if (t.id == timerId)
			{
				if (!t.running)
				{
					t.running = true;
					t.start = (new Date()).getTime();
				}
			}
		}
		$(this).fadeOut("quick"); // play button
		$(this).parent().children(".pause").fadeIn("quick"); // pause button
		$(this).parent().parent().removeClass("paused");
		storeData();
	});

	$("#timers").delegate("div.timer .toolbar .delete", "click", function() {
		var timerId = $(this).parent().parent().attr("data-tid");
		for (timer in timers)
		{
			var t = timers[timer];
			if (t.id == timerId)
			{
				timers.removeByValue(t);
			}
		}
		$(this).parent().parent().fadeOut("quick", function() { $(this).remove(); storeData(); });
	});
	
	// toolbar fade effect
	$("#timers").delegate("div.timer", "mouseenter", function() {
		$(this).children(".toolbar").animate({opacity:1})
	});
	$("#timers").delegate("div.timer", "mouseleave", function() {
		$(this).children(".toolbar").animate({opacity:0})
	});

	// add timer button fade effect
	$("#addTimer").mouseenter(function() {
		$("#addTimer").animate({opacity:1});
	});
	$("#addTimer").mouseleave(function() {
		$(this).animate({opacity:0.3});
	});

});