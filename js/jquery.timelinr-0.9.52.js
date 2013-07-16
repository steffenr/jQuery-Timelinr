/* ----------------------------------
jQuery Timelinr 0.9.52
tested with jQuery v1.6+

Copyright 2011, CSSLab.cl
Free under the MIT license.
http://www.opensource.org/licenses/mit-license.php

instructions: http://www.csslab.cl/2011/08/18/jquery-timelinr/
---------------------------------- */
(function($) {
  $.fn.timelinr = function(options){
    // default plugin settings
    settings = $.extend({
      orientation: 				'vertical',		// value: horizontal | vertical, default to horizontal
      containerDiv: 			'#timeline',		// value: any HTML tag or #id, default to #timeline
      datesDiv: 				'#dates',			// value: any HTML tag or #id, default to #dates
      datesSelectedClass: 		'selected',			// value: any class, default to selected
      datesSpeed: 				'normal',			// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to normal
      issuesDiv: 				'#issues',			// value: any HTML tag or #id, default to #issues
      issuesSelectedClass: 		'selected',			// value: any class, default to selected
      issuesSpeed: 				'fast',				// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to fast
      issuesTransparency: 		0.2,				// value: integer between 0 and 1 (recommended), default to 0.2
      issuesTransparencySpeed: 	500,				// value: integer between 100 and 1000 (recommended), default to 500 (normal)
      prevButton: 				'#prev',			// value: any HTML tag or #id, default to #prev
      nextButton: 				'#next',			// value: any HTML tag or #id, default to #next
      arrowKeys: 				'false',			// value: true | false, default to false
      startAt: 					1,					// value: integer, default to 1 (first)
      autoPlay: 				'false',			// value: true | false, default to false
      autoPlayDirection: 		'forward',			// value: forward | backward, default to forward
      autoPlayPause: 			2000				// value: integer (1000 = 1 seg), default to 2000 (2segs)
    }, options);

    $(function(){
      // setting variables... many of them
      var currentIndex = $(settings.datesDiv).find('a.'+settings.datesSelectedClass).index();
      var howMany
      var sizeIssue;
      var sizeDate;
      var margin;
      var animateIssuesSettings = {queue:false, duration:settings.issuesSpeed};
      var animateDatesSettings = {queue:false, duration:settings.datesSpeed};
      var animationData = {};
      var keys
      setup();
      var defaultPositionDates = parseInt($(settings.datesDiv).css(margin).substring(0,$(settings.datesDiv).css(margin).indexOf('px')));
      if (settings.autoPlay == 'true') {
        if (settings.autoPlayDirection == 'forward') {
          var autoPlayStep = 1;
        }
        else if (settings.autoPlayDirection == 'backward') {
          var autoPlayStep = 1;
        }
      }

      function setup() {
        //This is a separate function to keep a few variables from polluting
        //the namespace.
        howMany = $(settings.datesDiv+' li').length;
        var howManyIssues = $(settings.issuesDiv+' li').length;
        if (howMany > howManyIssues){
            howMany = howManyIssues;
        }
        //Variables that depend on the orientation
        if(settings.orientation == 'horizontal') {
          var sizeContainer = $(settings.containerDiv).width();
          sizeIssue = $(settings.issuesDiv+' li').width();
          sizeDate = $(settings.datesDiv+' li').width();
          margin = 'marginLeft';
          $(settings.issuesDiv).width(sizeIssue*howMany);
          $(settings.datesDiv).width(sizeDate*howMany).css(margin,sizeContainer/2-sizeDate/2);
          keys = {next: 39, prev: 37};
        }
        else if(settings.orientation == 'vertical') {
          var sizeContainer = $(settings.containerDiv).height();
          sizeIssue = $(settings.issuesDiv+' li').height();
          sizeDate = $(settings.datesDiv+' li').height();
          margin = 'marginTop';
          $(settings.issuesDiv).height(sizeIssue*howMany);
          $(settings.datesDiv).height(sizeDate*howMany).css(margin,sizeContainer/2-sizeDate/2);
          keys = {next: 40, prev: 38};
        }
      }

      $(settings.datesDiv).delegate(' a', "click", function(event){
        event.preventDefault();
        currentIndex = $(this).parent().index();
        moveTimelinr();
      });

      $(settings.nextButton).bind('click', function(event){
        event.preventDefault();
        if(currentIndex >= howMany-1) {
          // Prevents going past the last date by clicking too quickly
          $(settings.issuesDiv).stop();
          $(settings.datesDiv).stop();
          $(settings.datesDiv+' li:last-child a').click();
        }
        else {
          currentIndex += 1;
          moveTimelinr();
        }
      });

      $(settings.prevButton).click(function(event){
        event.preventDefault();
        if(currentIndex <= 0) {
          // Prevents going past the first date by clicking too quickly
          $(settings.issuesDiv).stop();
          $(settings.datesDiv).stop();
          $(settings.datesDiv+' li:first-child a').click();
        }
        else {
          currentIndex -= 1;
          moveTimelinr();
        }
      });

      function moveTimelinr() {
        // moving the issues
        animationData[margin] = -sizeIssue*currentIndex;
        $(settings.issuesDiv).animate(animationData, animateIssuesSettings);
        var issues = $(settings.issuesDiv+' li');
        issues.animate({'opacity':settings.issuesTransparency}, animateIssuesSettings);
        issues.removeClass(settings.issuesSelectedClass);
        var issue = issues.eq(currentIndex);
        issue.addClass(settings.issuesSelectedClass);
        issue.fadeTo(settings.issuesTransparencySpeed,1);
        // now moving the dates
        var dates = $(settings.datesDiv+' a')
        dates.removeClass(settings.datesSelectedClass);
        dates.eq(currentIndex).addClass(settings.datesSelectedClass);
        animationData[margin] = defaultPositionDates-(sizeDate*currentIndex);
        $(settings.datesDiv).animate(animationData, animateDatesSettings);
        hideButtons();
      }

      function hideButtons() {
        // prev/next buttons should disappear on first/last issue
        if( currentIndex == 0 ) {
          $(settings.prevButton).fadeOut('fast');
        }
        else if( currentIndex == howMany-1 ) {
          $(settings.nextButton).fadeOut('fast');
        }
        else {
          $(settings.nextButton+','+settings.prevButton).fadeIn('slow');
        }
      }

      // keyboard navigation, added since 0.9.1
      if(settings.arrowKeys=='true') {
        $(document).keydown(function(event){
          if (event.keyCode == keys.next) {
            $(settings.nextButton).click();
          }
          if (event.keyCode == keys.prev) {
            $(settings.prevButton).click();
          }
        });
      }

      // default position startAt, added since 0.9.3
      if (currentIndex == -1){
        currentIndex = settings.startAt-1
        $(settings.datesDiv+' li').eq(currentIndex).find('a').trigger('click');
      }

      // autoPlay, added since 0.9.4
      if(settings.autoPlay == 'true') {
        setInterval("autoPlay()", settings.autoPlayPause);
      }

    });

  };

  // autoPlay, added since 0.9.4
  function autoPlay(){
    currentIndex += autoPlayStep;
    if(currentIndex >= howMany) {
      currentIndex = 0;
    } else if(currentIndex < 0) {
      currentIndex = howMany - 1;
    }
    moveTimelinr();
  }

})(jQuery);
