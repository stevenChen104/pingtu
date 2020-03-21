window.addEventListener('load', function() {
    document.querySelector('#uploadFile').addEventListener('change' ,function() {
        uploadNewFile(this);
    });
});

function uploadNewFile(input) {
    if (input.files.length > 0) {
        var files = input.files;
        _.forEach(files, function(file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var file_name = file.name;
                var file_base64 = e.target.result;
                var node = document.querySelector('.preview-area');
                var template = '\
                    <div class="image-container" οndrοp="drop(event,this)" οndragοver="allowDrop(event)" draggable="true" οndragstart="drag(event, this)">\
                        <div class="preview-image" style="background-image: url(\'' + file_base64 + '\'");"></div>\
                        <img class="hide real-image" src="' + file_base64 + '"></img>\
                        <div class="file-name">' + file_name + '</div>\
                    </div>';
                render(node, template);
            }
            reader.readAsDataURL(file);
        });
    }
}

function render(node, template) {
    if (!node) return;
    node.insertAdjacentHTML('beforeend', template);
}

function removeNode(node) {
    node.parentNode.removeChild(node);
}

function pingtu() {
    var canvas = document.querySelector('#resultImage');
    if (canvas.getContext) {
        var images = document.querySelectorAll('.real-image');
        var ctx = canvas.getContext('2d');
        var total_height = 0;
        var total_width = 0;
        // 調整畫布大小
        _.forEach(images, function(img) {
            var this_height = img.height;
            var this_width = img.width;
            total_width = this_width > total_width ? this_width : total_width;
            total_height = total_height + this_height;
        });
        console.log(total_width);
        console.log(total_height)
        canvas.height = total_height;
        canvas.width = total_width;
        // 拼接圖片
        total_height = 0;
        total_width = 0;
        _.forEach(images, function(img) {
            var this_height = img.height;
            var this_width = img.width;
            ctx.drawImage(img, total_width, total_height, this_width, this_height);
            total_height = total_height + this_height;
        });
    } else {
        alert('網站目前不支援您的瀏覽器');
    }
}