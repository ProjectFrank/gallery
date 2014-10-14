$(document).ready(function() {
//    $('.gallery').append('<img src="http://media.giphy.com/media/12Zr3hYqvEPvB6/giphy.gif" style="width: 100%; height: auto; position: absolute; top: 0; left: 0;">');

    $('aside .gallery-selector').each(function() {
	var $this = $(this);
	if ($this.children().prop('href') == window.location.href) {
	    $this.addClass('current');
	}
    });
});


$(window).load(function() {
    $('.gallery > img').remove();
    var images = [];

    $('#gallery > li').each(function(_, picture) {
	var image = $(picture).find('img')[0].outerHTML;
	var title = $(picture).find('.image-title').text();
	var description = $(picture).find('.image-description').text();
	if (!title) {
	    title = 'Title';
	}
	if (!description) {
	    description = 'This is a descsription';
	}
	var html = '<div class="picture not-enlarged">';
	html += image;
	html += '<div class="caption">';
	html += '<h4>' + title + '</h4>';
	html += '<p>' + description + '</p>';
	html += '</div></div>';
	images.push(html);
    });

    $('#gallery1').remove();

    var $columns = $('.column');

    // Returns index of the shortest column
    function findShortestColumn($columns) {
	var shortestHeight;
	var shortestColumn;

	for (var i = 0, l = $columns.length; i < l; i++) {
	    var height = $($columns[i]).height();
	    console.log(height);
	    if (height < shortestHeight || shortestHeight == undefined) {
		shortestColumn = i;
		shortestHeight = height;
	    }
	}
	return shortestColumn;
    }

    // Add images so that columns are somewhat even in height
    images.forEach(function(image) {
    	var shortestColumn = findShortestColumn($columns);
    	$($columns[shortestColumn]).append(image);
    	var columnWidth = $($columns[shortestColumn]).width();
    });

    (function evenColumns() {
	var shortestColumnWidth = 100;
	var secondShortestColumnWidth = 100;
	var longestColumnWidth = 100;
	var shortestColumn = $columns[findShortestColumn($columns)];
	var $exclude = $columns.not(shortestColumn);
	var secondShortestColumn = $exclude[findShortestColumn($exclude)];
	$exclude = $exclude.not(secondShortestColumn);
	var longestColumn = $exclude[0];

	var shortestColumnHeight = $(shortestColumn).height();
	var secondShortestColumnHeight = $(secondShortestColumn).height();
	var longestColumnHeight = $(longestColumn).height();	   

	// Scale shortest column to equal height with second shortest column.
	var scaleFactor = secondShortestColumnHeight / shortestColumnHeight;
	shortestColumnWidth *= scaleFactor;
	shortestColumnHeight *= scaleFactor;

	// Scale second shortest and shortest columns to equal height with longest column
	scaleFactor = longestColumnHeight / secondShortestColumnHeight;
	shortestColumnWidth *= scaleFactor;
	secondShortestColumnWidth *= scaleFactor;

	// Convert widths to percentages
	var total = shortestColumnWidth + secondShortestColumnWidth + longestColumnWidth;
	shortestColumnWidth /= total;
	secondShortestColumnWidth /= total;
	longestColumnWidth /= total;

	shortestColumnWidth *= 100;
	secondShortestColumnWidth *= 100;
	longestColumnWidth *= 100;

	// Add styles to the columns
	$(shortestColumn).css('width', shortestColumnWidth + '%');
	$(secondShortestColumn).css('width', secondShortestColumnWidth + '%');
	$(longestColumn).css('width', longestColumnWidth + '%');	
    })();

    // Set up picture loading animation
    var $pictures = $('.gallery').find('.picture');
    $pictures.css({transform:'translateY(1280px)', opacity: 0});

    // Stagger animations for each individual picture
    var i = 0;
    var intervalID = window.setInterval(function() {
	TweenLite.to($pictures[i], 0.5, {transform:'translateY(0)', opacity: 1, ease:Circ.easeOut});
	i++;
	if (i >= $pictures.length) {
	    window.clearInterval(intervalID);
	}
    }, 150);
    
    // Curently enlarged picture
    var $currentlyEnlarged = $('.picture').first();
    
    function putAway() {
	// Calculate position to return picture to based on position
	// of placeholder
	var docPosition = $(window).scrollTop();
	var picPosition = $currentlyEnlarged.prev().offset().top;
	var fixedPositionTop = picPosition - docPosition;
	var fixedPositionLeft = $currentlyEnlarged.prev().offset().left;
	console.log(fixedPositionTop, fixedPositionLeft);

	// Remove lightbox controls
	$currentlyEnlarged.find('.fa-times').remove();
	$currentlyEnlarged.closest('.gallery').children('.fa-chevron-circle-left').remove();
	$currentlyEnlarged.closest('.gallery').children('.fa-chevron-circle-right').remove();
	// Animate picture returning to its spot in the gallery
	TweenLite.to($currentlyEnlarged, 0.8, {
	    top: fixedPositionTop + 'px',
	    left: fixedPositionLeft + 'px',
	    width: $currentlyEnlarged.parent().width() + 'px',
	    height: $currentlyEnlarged.prev().height(),
	    ease: Cubic.easeInOut,
	    onComplete: function() {
		// Remove placeholder after animation complete
		$currentlyEnlarged.prev().remove();

		// Remove all styling from .picture div after animation complete
		$currentlyEnlarged.attr('style', 'opacity: 1');
		$currentlyEnlarged.addClass('not-enlarged');		    
	    }
	});

	// Fade out and remove lightbox
	TweenLite.to($currentlyEnlarged.closest('.gallery').children('.lightbox'), 0.8, {
	    opacity: 0,
	    ease: Cubic.easeInOut,
	    onComplete: function() {
		$currentlyEnlarged.closest('.gallery').children('.lightbox').remove();
	    }
	});
	$currentlyEnlarged.find('.caption').removeAttr('style');	
    }

    $('.picture').on('click', function(event) {
	var $picture = $(this);

	// If the close button is clicked
	if ($(event.target).hasClass('fa-times')) {
	    putAway();
	}
	// If a not enlarged picture is clicked
	else if ($picture.hasClass('not-enlarged')) {
	    // Set $currentlyEnlarged to the clicked picture
	    $currentlyEnlarged = $picture;
	    var docPosition = $(window).scrollTop();
	    var picPosition = $picture.offset().top;
	    var fixedPositionTop = picPosition - docPosition;
	    var fixedPositionLeft = $picture.offset().left;
	    var picWidth = $picture.width();
	    var picHeight = $picture.height();
	    $picture.css({'position': 'fixed', 'left': fixedPositionLeft, 'top': fixedPositionTop, 'width': picWidth, 'z-index': 998});
	    $picture.before('<div class="placeholder">' + $currentlyEnlarged.children('img')[0].outerHTML + '</div>');
	    $picture.prev().children('img').css({
		width: '100%'
	    });

	    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	    var viewportAspect = viewportWidth / viewportHeight;
	    var pictureAspect = picWidth / picHeight;
	    
	    $picture.closest('.gallery').append('<div class="lightbox"></div>');
	    if (pictureAspect >= viewportAspect) {
		var scaleFactor = viewportWidth / picWidth;
		var fullHeight = picHeight * scaleFactor;
		var fullTop = (viewportHeight - fullHeight) / 2;
		var fullLeft = 0;
		TweenLite.to($picture, 0.8, {
		    top: fullTop + 'px',
		    left: fullLeft + 'px',
		    width: '100%',
		    height: fullHeight + 'px',
		    ease: Cubic.easeInOut
		});
	    } else {
		var scaleFactor = viewportHeight / picHeight;
		var fullWidth = picWidth * scaleFactor;
		var fullTop = 0;
		var fullLeft = (viewportWidth - fullWidth) / 2;

		TweenLite.to($picture, 0.8, {
		    top: fullTop + 'px',
		    left: fullLeft + 'px',
		    height: '100%',
		    width: fullWidth + 'px'
		});
	    }
	    $picture.removeClass('not-enlarged');
	    $picture.closest('.gallery').append('<i class="fa fa-chevron-circle-left"></i><i class="fa fa-chevron-circle-right"></i>');
	    TweenLite.to($picture.closest('.gallery').children('.lightbox'), 0.8, {
		opacity: 0.8,
		ease: Cubic.easeInOut
	    });
	    var button = '<i class="fa fa-times"></i>';
	    $picture.append(button);
	    $picture.find('.caption').css('height', '200px');
	}
    });

    // Listener for lightbox arrow controls
    $('.gallery').on('click', '.fa-chevron-circle-right, .fa-chevron-circle-left', function(e) {

	// Figure out which picture should be displayed next
	// If the right arrow is clicked
	if ($(e.target).hasClass('fa-chevron-circle-right')) {
	    var $nextPicture = $currentlyEnlarged.next();
    	    if (!$nextPicture.length) {
    		var $nextColumn = $currentlyEnlarged.parent().next('.column');
    		if (!$nextColumn.length) {
    		    $nextColumn = $currentlyEnlarged.closest('.gallery').children('.column').first();
    		}
    		$nextPicture = $nextColumn.children('.picture').first();
    	    }
	}
	// If the left arrow is clicked
	else {
	    var $nextPicture = $currentlyEnlarged.prev().prev();
    	    if (!$nextPicture.length) {
    		var $nextColumn = $currentlyEnlarged.parent().prev('.column');
    		if (!$nextColumn.length) {
    		    $nextColumn = $currentlyEnlarged.closest('.gallery').children('.column').last();
    		}
    		$nextPicture = $nextColumn.children('.picture').last();
    	    }
	}

	// Put current picture away	
	$currentlyEnlarged.removeAttr('style');
	$currentlyEnlarged.children('.caption').css('height', '100%');
	$currentlyEnlarged.children('.fa-times').remove();
	$currentlyEnlarged.addClass('not-enlarged');
	$currentlyEnlarged.prev().remove();

	// Calculate picWidth and picHeight
	var picWidth = $nextPicture.parent().width();
	var picHeight = $nextPicture.height();
	var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	var viewportAspect = viewportWidth / viewportHeight;
	var pictureAspect = picWidth / picHeight;
	
	// Bring out the next picture
	if (pictureAspect >= viewportAspect) {
	    var scaleFactor = viewportWidth / picWidth;
	    var fullHeight = picHeight * scaleFactor;
	    var fullTop = (viewportHeight - fullHeight) / 2;
	    var fullLeft = 0;
	    $nextPicture.css({
		width: '100%'
	    });
	} else {
	    var scaleFactor = viewportHeight / picHeight;
	    var fullWidth = picWidth * scaleFactor;
	    var fullTop = 0;
	    var fullLeft = (viewportWidth - fullWidth) / 2;
	    $nextPicture.css({
		width: fullWidth + 'px'
	    });
	}
	$nextPicture.css({
	    position: 'fixed',
	    top: fullTop + 'px',
	    left: fullLeft + 'px',
	    'z-index': 998
	});
	$nextPicture.removeClass('not-enlarged');
	$nextPicture.children('.caption').css({
	    height: '200px'
	});
	
	// Add placeholder
	$nextPicture.before('<div class="placeholder">' + $nextPicture.children('img')[0].outerHTML + '</div>');
	$nextPicture.prev().children('img').css({
	    width: '100%'
	});
	$nextPicture.append('<i class="fa fa-times"></i>');
	$currentlyEnlarged = $nextPicture;
    });

    // Resize/reposition elements on window resize or orientation change
    $(window).on('resize orientationChanged', function() {
	if ($currentlyEnlarged.hasClass('not-enlarged')) {
	    return;
	}
	var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	var viewportAspect = viewportWidth / viewportHeight;
	var picWidth = $currentlyEnlarged.prev().width();
	var picHeight = $currentlyEnlarged.prev().height();
	var pictureAspect = picWidth / picHeight;

	// If picture is wider than viewport
	if (pictureAspect >= viewportAspect) {
	    var scaleFactor = viewportWidth / picWidth;
	    var fullHeight = picHeight * scaleFactor;
	    var fullTop = (viewportHeight - fullHeight) / 2;
	    var fullLeft = 0;
	    $currentlyEnlarged.css({
		top: fullTop + 'px',
		left: fullLeft + 'px',
		width: '100%'
	    });
	}
	// If picture is narrower than viewport
	else {
	    var scaleFactor = viewportHeight / picHeight;
	    var fullWidth = picWidth * scaleFactor;
	    var fullTop = 0;
	    var fullLeft = (viewportWidth - fullWidth) / 2;
	    $currentlyEnlarged.css({
		top: fullTop + 'px',
		left: fullLeft + 'px',
		width: fullWidth + 'px'
	    });	    
	}
	
    });

    // Listener for hamburger menu

    $('nav .fa-bars').on('click', function() {
	var $nav = $('nav');
	$nav.toggleClass('show-nav');
    });

    $(document).on('click', function(e) {
	if ($(e.target).hasClass('fa-bars')) {
	    return;
	}
	var $nav = $('nav');
	$nav.removeClass('show-nav');
    });

    $('.gallery').on('click', '.lightbox', function() {
	putAway();
    });
});
