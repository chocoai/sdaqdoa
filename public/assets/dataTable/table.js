$(document).ready( function () {
    $('#table_persons ').DataTable({
        "order": [[ 3, "desc" ]],
        "pageLength": 100
    });
} );