let slideIndex = 0;
let slideshowInterval = null;

const pages = ["home", "contact"];

async function advanceSlide(dir, isUserClick) {
    let speed = isUserClick ? "fast" : "slow";
    let projectsJson = await grabProjectJson();
    let $image = $('.slideshow-image');

    projects = projectsJson.projects;

    slideIndex += dir;

    if (slideIndex >= projects.length) slideIndex = 0;
    else if (slideIndex < 0) slideIndex = projects.length - 1;

    $image.fadeOut(speed, () => {
        const url = `url("./images/${projects[slideIndex].image}")`;
        $image.css('background-image', url);
        $('.slideshow-caption').html(projects[slideIndex].shortDescription);
        $image.fadeIn(speed);

        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(() => advanceSlide(1, false), 4000);
    });
}

async function grabProjectJson() {
    return await (await fetch("projects.json")).json();
}

async function fetchPage(page) {
    return await (await fetch(`pages/${page}.html`)).text();
}

async function setPage(index) {
    let page = await fetchPage(pages[index]);
    $('#content').html(page);

    if (index == 0) {
        await generateProjectDescriptions();
        await advanceSlide(0, true);

        $('.next').click(() => advanceSlide(1, true));
        $('.back').click(() => advanceSlide(-1, true));
    }

    localStorage.setItem('lastPage', index);
}

async function generateProjectDescriptions() {
    let projectJson = await grabProjectJson();
    let $projects = $("#projects");
    let successes = projectJson.projects.filter(p => !p.failure);
    let failures = projectJson.projects.filter(p => p.failure);

    let heading = document.createElement('h1');

    heading.classList.add('heading');
    heading.innerHTML = "Successes";

    $projects.append(heading);

    const appendProject = (project) => {
        let div = document.createElement('div');
        let name = document.createElement("h1");
        let description = document.createElement("p");
        let image = document.createElement("div");
        let section = document.createElement('section');

        let desc = project.description;

        div.classList.add('project');
        name.classList.add('project-name');
        description.classList.add('project-description');
        image.classList.add('project-image');

        name.innerHTML = project.name;
        image.style.backgroundImage = `url("images/${project.image}")`;

        if (project.link !== "") {
            image.onclick = () => window.open(project.link, "_blank");
        }

        for (let j = 0; j < desc.length; j++) {
            description.innerHTML += desc[j];
        }

        section.append(name);
        section.append(description);

        div.append(image);
        div.append(section);

        $projects.append(div);
    };

    for (let i = 0; i < successes.length; i++) {
        appendProject(successes[i]);
    }

    heading = document.createElement('h1');
    heading.classList.add('heading');
    heading.innerHTML = "Failures";
    $projects.append(heading);

    for (let i = 0; i < failures.length; i++) {
        appendProject(failures[i]);
    }
}

$(async () => {
    let lastPage = localStorage.getItem('lastPage');
    if (lastPage == null) { lastPage = 0; }
    setPage(lastPage);
});