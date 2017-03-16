/*!
 * Snowplow v0.0.1 (https://github.com/snowplow/snowplow.github.com)
 * COMPANY
 */



(function ($)
{
	$('document').ready (function ()
	{
		var team = $('.team');
		var teamGrid = team.find('.grid');
		var teamItems = teamGrid.find('.item');
		var sep = $('<div class="sep col-xs-12 no-gutter"></div>');
			sep.height(0);
		var scrollingTimeOut;



		function showBio (el, bio, after)
		{
			sep
			.empty ()
			.append (bio.clone())
			.height(0);
			
			if (!after)
				sep.insertBefore (el);
			else
				sep.insertAfter (el);
			
			sep.height(bio.outerHeight())
			.find('.i-close').on ('click', function (e)
			{
				e.preventDefault ();
				e.stopPropagation ();
				sep.height(0).detach ().empty ();
				teamGrid.removeClass ('active');
				teamItems.removeClass ('active');
			});

			sep.css('transform', 'perspective( 2000px ) rotateX(0)');
		}


		teamItems.on ('click', function (e)
		{
			e.preventDefault ();
			teamGrid.addClass ('active');
			teamItems.removeClass ('active');

			var th = $(this);
			var bio = th.find ('.bio');
			var rowPos = th.position().top;
			var nextItems = th.nextAll();
			var totalNextItems = nextItems.length;

			if (totalNextItems.length==0)
				showBio (th, bio, true);
			else
				nextItems.each (function (i)
				{
					if ($(this).position().top > rowPos) // BREAK POINT
					{
						showBio (nextItems[i], bio);
						return false;
					}

					if (i+1==totalNextItems) // LAST ELEMENT
						showBio ($(this), bio, true);
				});

			// ACTIVATE
			th.addClass ('active');
		});
	});

})(jQuery);