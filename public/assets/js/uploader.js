$(function () {
    $("#upload").click(function () {
        $("#imgWait").show();
        var formData = new FormData();
        formData.append("myFile", document.getElementById("file1").files[0]);   
        $.ajax({
            url: "/admin/upload",
            type: "POST",
            data: formData,
            /**
            *必须false才会自动加上正确的Content-Type
            */
            contentType: false,
            /**
            * 必须false才会避开jQuery对 formdata 的默认处理
            * XMLHttpRequest会对 formdata 进行正确的处理
            */
            processData: false,
            success: function (data) {
                console.log(data);
                if (data.status == true) {
                    console.log(data.data.path);
                    $("#files").append(data.data.path+"\n");
                }
                if (data.status == "error") {
                    alert(data.msg);
                }
                $("#imgWait").hide();
            },
            error: function () {
                alert("上传失败！");
                $("#imgWait").hide();
            }
        });
    });
});

$(function () {
    $("#uploadImage").click(function () {
        $("#imgWait").show();
        var formData = new FormData();
        formData.append("myFile", document.getElementById("image").files[0]);   
        $.ajax({
            url: "/admin/upload",
            type: "POST",
            data: formData,
            /**
            *必须false才会自动加上正确的Content-Type
            */
            contentType: false,
            /**
            * 必须false才会避开jQuery对 formdata 的默认处理
            * XMLHttpRequest会对 formdata 进行正确的处理
            */
            processData: false,
            success: function (data) {
                console.log(data);
                if (data.status == true) {
                    console.log(data.data);
                    $("#imageUploaded").val("http://sdaoa.com:8088"+data.data.path.substr(6));
                }
                if (data.status == "error") {
                    alert(data.msg);
                }
                $("#imgWait").hide();
            },
            error: function () {
                alert("上传失败！");
                $("#imgWait").hide();
            }
        });
    });
});