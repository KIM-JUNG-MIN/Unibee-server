$(document).ready(function() {

  $('.tab-bar a').click(function() {
    console.log('hello');
    var tab_id = $(this).attr('data-tab');
    $('.tab-bar a').removeClass('is-active');
    $('.tab-content').removeClass('is-active');
    $(this).addClass('is-active');
    $("#" + tab_id).addClass('is-active');
  });

  resize();
  $(window).on("resize", function(){
      resize();
  });

});

function resize(){
  console.log('width : '+window.innerWidth);
  console.log('height : '+window.innerHeight);
  $("#myCanvas").outerHeight($(window).height()-$("#myCanvas").offset().top- Math.abs($("#myCanvas").outerHeight(true) - $("#myCanvas").outerHeight())-5);
}
