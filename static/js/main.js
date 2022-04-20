function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#imageResult')
                .attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

$(function () {
    $('#upload').on('change', function () {
        readURL(input);
    });
});

var input = document.getElementById('upload');
var infoArea = document.getElementById('upload-label');

input.addEventListener('change', predict);
async function predict(event) {
    var input = event.srcElement;
    const data = new FormData();
    data.append("file", input.files[0])
    const resp = await fetch("/predict", {
        method: 'POST',
        body: data
    });
    res = await resp.json()
    console.log(res);
    genResultTable(res);
    var fileName = input.files[0].name;
    infoArea.textContent = 'File name: ' + fileName;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function genResultTable(resp) {
    const labels = [];
    const conf = []

    for (let i = 0; i < resp.length; i++) {
        labels.push(capitalize(resp[i].class.split('_').join(' ')));
        conf.push(resp[i].confidence.slice(0, 4));
    }

    const data = {
        labels: labels,
        datasets: [{
            label: 'Classification Results',
            data: conf,
            backgroundColor: [
                'rgba(255, 99, 132, 0.4)',
                'rgba(255, 159, 64, 0.4)',
                'rgba(255, 205, 86, 0.4)',
                'rgba(75, 192, 192, 0.4)',
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
            ],
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {}
    };
    const chart = document.getElementById('results');
    const myChart = new Chart(
        chart,
        config
    );
    chart.style.visibility = "visible"
}