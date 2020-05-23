let pointData = {};
let jsonFile = {};

async function grabPointData(x, y) {
    let points = await fetch(`https://api.weather.gov/points/${x},${y}/`);
    return await points.json();
}

async function grabWeatherData(x, y) {
    let forecast = await fetch(pointData.properties.forecast);
    return await forecast.json();
}

function forecast() {
    let $day = $("main");

    let location = pointData.properties.relativeLocation;
    let city = location.properties.city;
    let state = location.properties.state;
    $('#position').html(`Location: ${city}, ${state}`);

    displayWeather(0, jsonFile.properties.periods[0]);
    let index = 1;
    for (let i = 1; i < jsonFile.properties.periods.length - 1; i++) {
        let period = jsonFile.properties.periods[i];
        if (period.isDaytime) {
            $day.clone().appendTo("#forecasts");
            displayWeather(index, period);
            index += 1;
        }
    }

    $('main').each((i, el) => {
        $(el).slideDown(i * 100);
    });

    let empty = document.createElement('main');
    empty.innerHTML = "A Simple weather app <br><br>" +
        "<img src='https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/emojidex/112/umbrella_2602.png'>"
        + "<br>Created by: <br>Jakub Szarkowicz <br>&<br> Evan Smith";
    $('#forecasts').append(empty);

    $('.loader').fadeOut('fast');
}

function displayWeather(day, period) {
    let { temperature, temperatureUnit, windSpeed,
        windDirection, shortForecast, icon, name } = period;

    $('.temp')[day].innerHTML = `${temperature} °${temperatureUnit}`;
    $('.wind')[day].innerHTML = windSpeed + ` (${windDirection})`;
    $('.forecast')[day].innerHTML = shortForecast;
    $('.day')[day].innerHTML = name;
    $('.image')[day].src = icon;
}

// When the website loads
$(async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            pointData = await grabPointData(pos.coords.latitude, pos.coords.longitude);
            jsonFile = await grabWeatherData(pos.coords.latitude, pos.coords.longitude);
            forecast();
        }, (err) => {
            console.error(err);
        })
    }
});