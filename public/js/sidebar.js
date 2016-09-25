$(document).ready(function() {

  $(".nav.navbar-nav li").on("click", function() {

    $(".nav.navbar-nav li").removeClass("active");
    $(this).addClass("active");

    switch ($(this).attr('id')) {
      case 'nav-user':
        if ($(this).hasClass("active")) {
          controlUserNav();
          closeFriendNav();
        }
        break;
      case 'nav-friend':
        if ($(this).hasClass("active")) {
          controlFriendNav();
          closeUserNav();
        }
        break;
      case 'nav-chat':
        if ($(this).hasClass("active")) {
          closeUserNav();
          closeFriendNav();
        }
        break;
    }

  });

});

function controlUserNav() {
  var element = document.getElementById('userSidenav'),
      style = window.getComputedStyle(element),
      display = style.getPropertyValue('display');

  if (display == 'none') {
    element.style.display="block";
  }else{
    element.style.display="none";
  }
}

function closeUserNav() {
  document.getElementById("userSidenav").style.display="none";
}


function controlFriendNav() {
  var element = document.getElementById('friendSidenav'),
      style = window.getComputedStyle(element),
      display = style.getPropertyValue('display');

  if (display == 'none') {
    element.style.display="block";
  }else{
    element.style.display="none";
  }
}

function closeFriendNav() {
  document.getElementById("friendSidenav").style.display="none";
}
