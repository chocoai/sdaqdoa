$("#unSelect").click(function () {     
    $(".checkBox input:checkbox").each(function () {
        $(this).removeAttr("checked");
    });      
});   
    
$("#selectAll").click(function () {
    $(".checkBox input:checkbox").each(function () {
        $(this).attr("checked",true);
        $(this).parents('.checkbox').find('span').addClass('checked');
    });   
});

$("#selectSupport").click(function () {
    $(".checkBox input:checkbox.support").each(function () {
        $(this).attr("checked",true);
    });   
});

$("#selectNormal").click(function () {
    $(".checkBox input:checkbox.normal").each(function () {
        $(this).attr("checked",true);
    });   
});

 $("select").multipleSelect({
            multiple: true,
            multipleWidth: 80,
            width: '100%'
        });
