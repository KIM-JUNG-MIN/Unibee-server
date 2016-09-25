
 $(document).ready(function(){

     $('#searchBtn').click(function(){
         var searchString = $('#searchText').val(),
             foundLi = $('li:contains("' + searchString + '")');

         foundLi.addClass('found');
     });


     $('#selectFriend').click(function(){
        var result = $('.found').text();

        if (result == '') {
            console.log('no');
        }else{

          $.ajax({
             url: 'http://localhost:9000/friend/add',
             type:'POST',
             data: {friend_id: result},
             success:function(data){
                 alert(data);
                 console.log('hello');
             }
           });

        }
     });

});
