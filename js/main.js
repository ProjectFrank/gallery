$(document).ready(function() {
    $('.gallery').append('<img src="http://media.giphy.com/media/12Zr3hYqvEPvB6/giphy.gif" style="width: 100%; height: auto; position: absolute; top: 0; left: 0;">');
});

$(window).load(function() {
    $('.gallery > img').remove();
    var images = [];

    $('#gallery1 > li').each(function(_, picture) {
	var image = $(picture).find('img')[0].outerHTML;
	var title = $(picture).find('.image-title').text();
	var description = $(picture).find('.image-description').text();
	if (!title) {
	    title = 'Title';
	}
	if (!description) {
	    description = 'This is a descsription';
	}
	var html = '<div class="picture hover-zoom">';
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
    function findShortestColumn() {
	var shortestHeight;
	var shortestColumn;

	for (var i = 0, l = $columns.length; i < l; i++) {
	    var height = $($('.column')[i]).height();
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
    	var shortestColumn = findShortestColumn();
    	$($columns[shortestColumn]).append(image);
    	var columnWidth = $($columns[shortestColumn]).width();
    });

    // Set up picture loading animation
    var $pictures = $('.gallery').find('.picture');
    $pictures.css({top: '1280px', opacity: 0});

    // Stagger animations for each individual picture
    var i = 0;
    var intervalID = window.setInterval(function() {
	$($pictures[i]).animate({
	    top: 0,
	    opacity: 1
	}, 500, 'easeInOutCubic');
	i++;
	if (i >= $pictures.length) {
	    window.clearInterval(intervalID);
	}
    }, 180);
    
    // Curently enlarged picture
    var $currentlyEnlarged;
    
    $('.picture').on('click', function(event) {
	if ($(event.target).hasClass('fa-times')) {
	    console.log('clicked X');
	    var docPosition = $(window).scrollTop();
	    var picPosition = $(this).prev().offset().top;
	    var fixedPositionTop = picPosition - docPosition;
	    var fixedPositionLeft = $(this).prev().offset().left;
	    console.log(fixedPositionTop, fixedPositionLeft);
	    $(this).find('.fa-times').remove();
	    $(this).closest('.gallery').children('.fa-chevron-circle-left').remove();
	    $(this).closest('.gallery').children('.fa-chevron-circle-right').remove();
	    $(this).animate({
		top: fixedPositionTop + 'px',
		left: fixedPositionLeft + 'px',
		width: $columns.width() + 'px',
		height: $(this).prev().height()
	    }, 1000, 'easeInOutCubic', function() {
		$(this).prev().remove();
		$(this).attr('style', 'opacity: 1');
		$(this).addClass('hover-zoom');
	    });
	    $(this).closest('.gallery').children('.lightbox').animate({
		opacity: 0
	    }, 1000, 'easeInOutCubic', function() {
		$(this).closest('.gallery').children('.lightbox').remove();
	    });
	    $(this).find('.caption').removeAttr('style');
	} else if ($(this).hasClass('hover-zoom')) {
	    // Set $currentlyEnlarged to the clicked picture
	    $currentlyEnlarged = $(this);
	    var docPosition = $(window).scrollTop();
	    var picPosition = $(this).offset().top;
	    var fixedPositionTop = picPosition - docPosition;
	    var fixedPositionLeft = $(this).offset().left;
	    var picWidth = $(this).width();
	    var picHeight = $(this).height();
	    $(this).css({'position': 'fixed', 'left': fixedPositionLeft, 'top': fixedPositionTop, 'width': picWidth, 'z-index': 998});
	    $(this).before('<div class="placeholder">' + $currentlyEnlarged.children('img')[0].outerHTML + '</div>');
	    $(this).prev().children('img').css({
		width: '100%'
	    });

	    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	    var viewportAspect = viewportWidth / viewportHeight;
	    var pictureAspect = picWidth / picHeight;
	    
	    $(this).closest('.gallery').append('<div class="lightbox"></div>');
	    if (pictureAspect >= viewportAspect) {
		var scaleFactor = viewportWidth / picWidth;
		var fullHeight = picHeight * scaleFactor;
		var fullTop = (viewportHeight - fullHeight) / 2;
		var fullLeft = 0;
		$(this).animate({
		    top: fullTop + 'px',
		    left: fullLeft + 'px',
		    width: '100%',
		    height: fullHeight + 'px'
		}, 1000, 'easeInOutCubic');
	    } else {
		var scaleFactor = viewportHeight / picHeight;
		var fullWidth = picWidth * scaleFactor;
		var fullTop = 0;
		var fullLeft = (viewportWidth - fullWidth) / 2;
		$(this).animate({
		    top: fullTop + 'px',
		    left: fullLeft + 'px',
		    height: '100%',
		    width: fullWidth + 'px'
		}, 1000, 'easeInOutCubic');
	    }
	    $(this).removeClass('hover-zoom');
	    $(this).closest('.gallery').append('<i class="fa fa-chevron-circle-left"></i><i class="fa fa-chevron-circle-right"></i>');
	    $(this).closest('.gallery').children('.lightbox').animate({
		opacity: 0.8
	    }, 1000, 'easeInOutCubic');
	    var button = '<i class="fa fa-times"></i>';
	    $(this).append(button);
	    $(this).find('.caption').css('height', '200px');
	}
    });
    $('.gallery').on('click', '.fa-chevron-circle-right, .fa-chevron-circle-left', function(e) {
	if ($(e.target).hasClass('fa-chevron-circle-right')) {
	    var $nextPicture = $currentlyEnlarged.next();
    	    if (!$nextPicture.length) {
    		var $nextColumn = $currentlyEnlarged.parent().next('.column');
    		if (!$nextColumn.length) {
    		    $nextColumn = $currentlyEnlarged.closest('.gallery').children('.column').first();
    		}
    		$nextPicture = $nextColumn.children('.picture').first();
    	    }
	} else {
	    var $nextPicture = $currentlyEnlarged.prev().prev();
    	    if (!$nextPicture.length) {
    		var $nextColumn = $currentlyEnlarged.parent().prev('.column');
    		if (!$nextColumn.length) {
    		    $nextColumn = $currentlyEnlarged.closest('.gallery').children('.column').last();
    		}
    		$nextPicture = $nextColumn.children('.picture').last();
    	    }
	}
	
	$currentlyEnlarged.removeAttr('style');
	$currentlyEnlarged.children('.caption').css('height', '100%');
	$currentlyEnlarged.children('.fa-times').remove();
	$currentlyEnlarged.addClass('hover-zoom');
	$currentlyEnlarged.prev().remove();

	// Calculate picWidth and picHeight

	var picWidth = $columns.width();
	var picHeight = $nextPicture.height();

	var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	var viewportAspect = viewportWidth / viewportHeight;
	var pictureAspect = picWidth / picHeight;
	
	if (pictureAspect >= viewportAspect) {
	    var scaleFactor = viewportWidth / picWidth;
	    var fullHeight = picHeight * scaleFactor;
	    var fullTop = (viewportHeight - fullHeight) / 2;
	    var fullLeft = 0;
	    $nextPicture.css({
		width: '100%',
		height: fullHeight + 'px',
	    });
	} else {
	    var scaleFactor = viewportHeight / picHeight;
	    var fullWidth = picWidth * scaleFactor;
	    var fullTop = 0;
	    var fullLeft = (viewportWidth - fullWidth) / 2;
	    $nextPicture.css({
		height: '100%',
		width: fullWidth + 'px',
	    });
	}
	$nextPicture.css({
	    position: 'fixed',
	    top: fullTop + 'px',
	    left: fullLeft + 'px',
	    'z-index': 998
	});
	$nextPicture.removeClass('hover-zoom');
	$nextPicture.children('.caption').css({
	    height: '200px'
	});
	// add placeholder
	$nextPicture.before('<div class="placeholder">' + $currentlyEnlarged.children('img')[0].outerHTML + '</div>');
	$nextPicture.prev().children('img').css({
	    width: '100%'
	});
	$nextPicture.append('<i class="fa fa-times"></i>');
	$currentlyEnlarged = $nextPicture;
    });

    // Resize/reposition elements on window resize or orientation change
    $(window).on('resize orientationChanged', function() {
	if ($currentlyEnlarged.hasClass('hover-zoom')) {
	    return;
	}
	var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	var viewportAspect = viewportWidth / viewportHeight;
	var picWidth = $currentlyEnlarged.prev().width();
	var picHeight = $currentlyEnlarged.prev().height();
	var pictureAspect = picWidth / picHeight;

	if (pictureAspect >= viewportAspect) {
	    var scaleFactor = viewportWidth / picWidth;
	    var fullHeight = picHeight * scaleFactor;
	    var fullTop = (viewportHeight - fullHeight) / 2;
	    var fullLeft = 0;
	    $currentlyEnlarged.css({
		top: fullTop + 'px',
		left: fullLeft + 'px',
		width: '100%',
		height: fullHeight + 'px'
	    });
	} else {
	    var scaleFactor = viewportHeight / picHeight;
	    var fullWidth = picWidth * scaleFactor;
	    var fullTop = 0;
	    var fullLeft = (viewportWidth - fullWidth) / 2;
	    $currentlyEnlarged.css({
		top: fullTop + 'px',
		left: fullLeft + 'px',
		height: '100%',
		width: fullWidth + 'px'
	    });	    
	}

	
	// Recalculate top and left values so that image is centered
	// Recalculate height and width values
	
    });
});
