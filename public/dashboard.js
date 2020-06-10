let isPaused = false;
let clockInterval = null;
let started = false;

function startTimer() {
    if (started) {
        return;
    }

    started = true;

    if (!isPaused) {
        time = 2 * 3.6e6;
    }

    isPaused = false;

    clockInterval = setInterval(function () {
        time -= 1000;

        const hours = Math.floor(
            (time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
        $(".clock").html(`${hours}:${minutes}:${seconds}`);

        if (time < 0) {
            clearInterval(clockInterval);
            $(".clock").html("Times Up");
            $(".clock").css("background-color", "red");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(clockInterval);
    $(".clock").html("2:00:00");
    started = false;
    isPaused = false;
}
function stopTimer() {
    clearInterval(clockInterval);
    isPaused = true;
    started = false;
}
