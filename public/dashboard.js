async function getProjects() {
    const file = await fetch("projects.json");
    return (await file.json()).projects;
}

const Tabs = {
    LOGIN: 0,
    TIMER: 1,
    IDEAS: 2,
    NOTES: 3,
    ADD_PROJECT: 4,
};

const tabs = ["login", "timer", "ideas", "notes", "add"];
const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,15}$/;
let isLogged = false;

function setTab(index) {
    $("main section").each((j, el) => {
        if (index === j) {
            $(el).show();
            onDashboardTabChange(j);
        } else {
            $(el).hide();
        }
    });
}

async function onDashboardTabChange(i) {
    switch (i) {
        case Tabs.NOTES:
            displayNotes(true);
            break;
    }
}

async function displayNotes(forceOn) {
    $(".projects").empty();
    const proj = await getProjects();
    for (let i = 0; i < proj.length; i++) {
        const project = document.createElement("button");
        project.innerHTML = proj[i].name;
        project.addEventListener("click", () => {
            $(".notepad").html(proj[i].notes);
            $(".projects button").each((i, e) => {
                e.disabled = false;
            });
            project.disabled = true;
        });

        if (i === 0) {
            project.disabled = true;
        }

        $(".projects").append(project);
    }
}

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

$("#nav-bar a").each((i, el) => {
    $(el).click(() => {
        setTab(i);
    });
});

$("#login-form").submit(function (e) {
    e.preventDefault();
    const form = $(this)[0];

    const email = form["email"].value;
    if (!emailRegex.test(email)) {
        console.log("Username is not in a correct format");
        return;
    }

    const password = form["password"].value;
    if (!passRegex.test(password)) {
        console.log("Password is not in a correct format");
        return;
    }

    // TODO: Do sign in
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch(function (err) {
            console.log("Oh noes! Somting wents dah rong");
        });

    isLogged = true;
});

setTab(0);

$(() => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log(user);
            const signOut = document.createElement("a");
            signOut.innerHTML = "Sign Out";
            signOut.classList.add("signOut");
            signOut.addEventListener("click", () => {
                firebase
                    .auth()
                    .signOut()
                    .then(() => {
                        $(".signOut").remove();
                    });
            });
            $("#nav-bar").append(signOut);
        } else {
        }
    });
});
