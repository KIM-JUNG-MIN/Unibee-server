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
  // $(window).on("resize", function(){
  //     resize();
  //     window.location.reload(true);
  // });

});

function resize(){
  var canvas = document.getElementById('myCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
