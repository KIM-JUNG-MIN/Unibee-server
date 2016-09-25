$('#makeBeeModal').on('show.bs.modal', function (event) {
  var modal = $(this)
  modal.find('input,textarea')
        .val('')
        .end()
})

// $('#bee_submit').on('click', function(event) {
//   // $('#makeBeeModal').modal('toggle');
//   //   return false;
// });
