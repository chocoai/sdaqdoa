$(document).ready( function () {
    $('#table_persons ').DataTable({
        "order": [[ 3, "desc" ]],
        "pageLength": 100
    });
});

function pass(){
    console.log($('textarea#words').val().length);
    var btn = $('button#btn');

    var ps = $('textarea#words').val();

    if (ps.length<5) { 
        console.log("too shrot");
        btn.attr("disabled",true);
        btn.addClass('weui-btn_disabled');

    } else {
        btn.attr("disabled",false);
        btn.removeClass('weui-btn_disabled');
    }
}