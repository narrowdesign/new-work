$(function() {

  var WIN = $(window);
  var DOC = $(document);
  var BODY = $("body");

  var _winW;
  var _winH;
  var aspect = .618033;
  var axis = .7237;
  var spiralOrigin;
  var colorsArray = [];
  var bgColorsArray = [];
  var rotation = 0;
  var currentSection = 0;
  var touchStartY = 0;
  var moved = 0;
  var animRAF;
  var animating = false;
  var isTouchDevice;
  var showLineTimeout;

  var safari = false;
  if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) { safari = true; }

  WIN.on('touchstart',function(){
    isTouchDevice = true;
  })

  resizeHandler();
// EVENTS
/////////

  // UTIL EVENTS
  WIN.on('resize',resizeHandler);

  WIN.on('wheel', function(e) {
    moved = e.originalEvent.deltaY || 0;
    rotation += moved/-10;
    e.preventDefault();
    startScrollTimeout()
    cancelAnimationFrame(animRAF);
    requestAnimationFrame(function(){
      scrollHandler();
    })
  });

  WIN.on('touchstart', function(e) {
    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    touchStartY = touch.pageY;
    cancelAnimationFrame(animRAF);
  })
  WIN.on('touchmove', function(e) {
    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    moved = (touchStartY - touch.pageY) * 3;
    touchStartY = touch.pageY;
    rotation += moved/-10;
    startScrollTimeout();
    cancelAnimationFrame(animRAF);
    scrollHandler()
  });
  WIN.on('touchend', function(e) {
    animateScroll()
  })
  WIN.on('scroll',function(e) {

  })

  WIN.on('keydown',function(e) {
    if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 32) {
      cancelAnimationFrame(animRAF);
      animateScroll((currentSection + 1) * -90,rotation)
    } else if (e.keyCode === 37 || e.keyCode === 38) {
      cancelAnimationFrame(animRAF);
      animateScroll((currentSection - 1) * -90,rotation)
    }
    scrollHandler()
  })

  $('.js-section').on('click',function() {
    cancelAnimationFrame(animRAF)
    animateScroll($(this).index() * -90,rotation);
  })

  $('.js-section-number').on('click', function() {
    BODY.addClass('is-gallery');
  })
  $('.js-gallery').on('click', function() {
    BODY.removeClass('is-gallery');
  })

// FUNCTIONS
////////////
  function animateScroll(targR,startR,speed) {
    var distance = startR - targR;
    var mySpeed = speed || .2;
    if ((targR && Math.abs(targR - rotation) > .1) || Math.abs(moved) > 1) {
      if (targR) {
        rotation += mySpeed * (targR - rotation);
      } else {
        moved *= .93;
        rotation += moved/-10;
      }
      scrollHandler();
      animRAF = requestAnimationFrame(function(){
        animateScroll(targR,startR,speed)
      });
    } else if (targR) {
      cancelAnimationFrame(animRAF)
      rotation = targR;
      scrollHandler();
    }
  }
  function scrollHandler() {
    var scale = Math.pow(aspect,rotation/90);
    $('.js-spiral').css({
      transform: 'rotate(' + rotation + 'deg) scale(' + scale + ')',
    })
    currentSection = Math.floor((rotation-30)/-90);
    var bg = bgColorsArray[currentSection-1]
    var color = colorsArray[currentSection-1]
    BODY.css({
      backgroundColor: bg,
      color: color
    })
    $('.js-project').css({
      color: color
    })
    for (var i=0;i<$('.js-section').length;i++) {
      if (i - currentSection < -1) {
        $('.js-section').eq(i).css({
          display: 'none'
        })
      } else {
        $('.js-section').eq(i).css({
          display: 'block'
        })
      }
      if (currentSection > 1) {
        $('.js-section').eq(i).css({
          backgroundColor: bg,
          transitionDelay: (i-currentSection)/10 + 's'
        })
      }
    }
    $('.js-section').removeClass('active')
    $('.js-section').eq(currentSection).css({
      backgroundColor: ''
    }).addClass('active')

    $('.js-spiral-line').css({
      display: 'block'
    })
  }

  function resizeHandler () { // Set the size of images and preload them
    _winW = window.innerWidth;
    _winH = window.innerHeight;
    buildSpiral()
  }
  function buildSpiral() {
    spiralOrigin = Math.floor(_winW * axis) + 'px ' + Math.floor(_winW * aspect * axis) +'px';
    var sectionOrigin = Math.floor(_winW * axis) + 'px ' + Math.floor(_winW * aspect * axis) +'px';
    var w = _winW * aspect;
    var h = _winW * aspect;
    if (_winW < 960) {
      spiralOrigin = Math.floor((_winW/aspect) * aspect * (1 - axis)) +'px ' + Math.floor((_winW/aspect) * axis) + 'px ';
      sectionOrigin = Math.floor((_winW/aspect) * aspect * (1 - axis)) +'px ' + Math.floor((_winW/aspect) * axis) + 'px ';
      w = _winW;
      h = _winW;
    }
    var translate = '';
    if (safari) {
      translate = 'translate3d(0,0,0)'
    }
    $('.js-spiral').css({
      transformOrigin: spiralOrigin,
      backfaceVisiblity: 'hidden'
    })
    $('.js-section').each(function(i){
      var myRot = Math.floor(90*i);
      var scale = toFix(Math.pow(aspect, i));
      if (scale.indexOf('e') != -1) {

      }
      $(this).css({
        width: w,
        height: h,
        transformOrigin: sectionOrigin,
        transform: 'rotate(' + myRot + 'deg) scale(' + scale + ') ' + translate,
        backfaceVisiblity: 'hidden',
      })
      if (i > 0 && bgColorsArray.length < $('.js-section').length) {
        var bg = $(this).css('background')
        bg = bg.substr(0, bg.indexOf(')'))
        var color = $(this).css('color')
        colorsArray.push(color);
        bgColorsArray.push(bg);
        $(this).css({
          backgroundColor: '#000'
        })
      }
    })
    function toFix(i){
     var str='';
     do{
       let a = i%10;
       i=Math.trunc(i/10);
       str = a+str;
     }while(i>0)
     return str;
    }
    scrollHandler();
  }

  function startScrollTimeout () {
    clearTimeout(showLineTimeout)
    showLineTimeout = setTimeout(function(){
      $('.js-spiral-line').css({
        display: 'none'
      })
      console.log(rotation%90)
      if (rotation%90 < -80 || rotation%90 > -20) {
        cancelAnimationFrame(animRAF);
        animateScroll(currentSection * -90,rotation,.05);
      }
    },500);
  }

})
