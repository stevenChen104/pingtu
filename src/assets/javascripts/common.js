var file_seq = 0;
var promises = [];

window.addEventListener('load', function () {
    document.querySelector('#uploadFile').addEventListener('change', function () {
        uploadNewFile(this);
    });
});

function uploadNewFile(input) {
    if (input.files.length > 0) {
        var sort_type = document.querySelector('input[type=radio][name="sort"]:checked').value;
        switch (sort_type) {
            case 'byUpload':
                var files = input.files;
                break;
            case 'byName':
                var files = sortFilesByName(input.files);
                break;
            case 'byUser':
                break;
        }
        setupReader(files, 0);
    }
}

function sortFilesByName(files) {
    for (var i = 0; i < files.length; i++) {
        files[i].seq = Number(files[i].name.replace(/\D/g, ''));
    }
    files = _.orderBy(files, ['seq'], ['asc']);
    return files;
}

function setupReader(files, pos) {
    var reader = new FileReader();
    reader.onload = function (e) {
        readAndLoadFile(e, files, pos);
    };
    reader.readAsDataURL(files[pos]);
}

function readAndLoadFile(e, files, pos) {
    var file = files[pos];
    var file_name = file.name;
    var file_base64 = e.target.result;
    var slider = document.querySelector('.preview-area');
    var node = document.querySelector('.preview-area .upload-item');
    var template = '\
        <div class="image-container" οndrοp="drop(event,this)" οndragοver="allowDrop(event)" draggable="true" οndragstart="drag(event, this)">\
            <div class="preview-image" style="background-image: url(\'' + file_base64 + '\'");">\
                <div class="remove-icon" onclick="removeImageContainer(this)"></div>\
            </div>\
            <img class="hide real-image" src="' + file_base64 + '"></img>\
            <div class="file-seq"></div>\
            <div class="file-name">' + file_name + '</div>\
        </div>';
    render(node, template, 'beforebegin');
    addSeqToPreviewer();
    slider.scrollLeft = slider.scrollWidth;
    if (pos < files.length - 1) {
        setupReader(files, pos + 1);
    }
}

function addSeqToPreviewer() {
    var _containers = document.querySelectorAll('.preview-area .image-container');
    for (var i = 0; i < _containers.length; i++) {
        _containers[i].querySelector('.file-seq').innerText = i + 1;
    }
}

function triggerUpload() {
    document.querySelector('.input-area input[type=file]').click();
}

function render(node, template, position) {
    if (!node) return;
    if (position) {
        node.insertAdjacentHTML(position, template);
    } else {
        node.insertAdjacentHTML('beforeend', template);
    }
}

function removeNode(node) {
    node.parentNode.removeChild(node);
}

function pingtu() {
    var canvas = document.querySelector('#resultImage');
    if (canvas.getContext) {
        var result_area = document.querySelector('.result-area');
        var images = document.querySelectorAll('.real-image');
        var ctx = canvas.getContext('2d');
        var total_height = 0;
        var total_width = 0;
        if (images.length > 0) {
            // 調整畫布大小
            _.forEach(images, function (img) {
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
            _.forEach(images, function (img) {
                var this_height = img.height;
                var this_width = img.width;
                ctx.drawImage(img, total_width, total_height, this_width, this_height);
                total_height = total_height + this_height;
            });
            result_area.classList.remove('hide');
            showWhile('welldone');
        } else {
            showWhile('nothing');
        }

    } else {
        alert('網站目前不支援您的瀏覽器');
    }
}

function removeImageContainer(ele) {
    var _container = ele.parentNode.parentNode;
    removeNode(_container);
    addSeqToPreviewer();
}

function clearImages() {
    var _remove_buttons = document.querySelectorAll('.preview-area .image-container .remove-icon');
    var result_area = document.querySelector('.result-area');
    _.forEach(_remove_buttons, function (button) {
        button.click();
    });
    result_area.classList.add('hide');
}

function showWhile(modalName) {
    var modal = document.querySelector('#' + modalName);
    fadeIn(modal);
    window.setTimeout(function () {
        fadeOut(modal);
    }, 1500);
}

function fadeIn(el) {
    el.classList.remove('hide');
    el.style.opacity = 0;
    var last = +new Date();
    var tick = function () {
        el.style.opacity = +el.style.opacity + (new Date() - last) / 100;
        last = +new Date();
        if (+el.style.opacity < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 1);
        } else {
            el.style.opacity = 1;
        }
    };
    tick();
}

function fadeOut(el) {
    el.style.opacity = 1;
    var last = +new Date();
    var tick = function () {
        el.style.opacity = +el.style.opacity - (new Date() - last) / 100;
        last = +new Date();
        if (+el.style.opacity > 0) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 1);
        } else {
            el.style.opacity = 0;
            el.classList.add('hide');
        }
    };
    tick();
}

function changeSortType(sort_type) {
    var _sort_type = document.querySelector('input[type=radio][name="sort"][value="' + sort_type + '"]');
    _sort_type.checked = true;
}