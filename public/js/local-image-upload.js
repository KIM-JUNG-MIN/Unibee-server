function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah')
                .attr('src', e.target.result);

        };

        reader.readAsDataURL(input.files[0]);
                    console.log(input.files[0].name);
    }
}

document.getElementById('file-input').onchange = function (e) {
    loadImage(
        e.target.files[0],
        function (img) {
          console.log(img);
          $('#userprofileimage').attr('src', img);
          //document.body.appendChild(img);
        },
        {
          maxWidth: 150,
          maxHeight: 150
        } // Options
    );
};
