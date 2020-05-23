let slideIndex = 0;
let slideshowInterval = null;

const pages = ["home", "contact"];

async function advanceSlide(dir, isUserClick) {
    let speed = isUserClick ? "fast" : "slow";

    let projectsJson = await grabProjectJson();
    projects = projectsJson.projects;

    slideIndex += dir;
    if (slideIndex >= projects.length) slideIndex = 0;
    else if (slideIndex < 0) slideIndex = projects.length - 1;

    let $image = $('.slideshow-image');
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

        $('#next').click(() => advanceSlide(1, true));
        $('#back').click(() => advanceSlide(-1, true));
    }

    localStorage.setItem('lastPage', index);
}

async function generateProjectDescriptions() {
    let projectJson = await grabProjectJson();
    let $projects = $("#projects");

    for (let i = 0; i < projectJson.projects.length; i++) {
        let div = document.createElement('div');
        let name = document.createElement("h1");
        let image = document.createElement("div");
        let description = document.createElement("p");
        let section = document.createElement('section');

        div.classList.add('project');

        image.classList.add('project-image');
        name.classList.add('project-name');
        description.classList.add('project-description');

        let desc = projectJson.projects[i].description;
        for (let j = 0; j < desc.length; j++) {
            description.innerHTML += desc[j];
        }

        name.innerHTML = projectJson.projects[i].name;
        image.style.backgroundImage = `url("images/${projectJson.projects[i].image}")`;

        section.append(name);
        section.append(description);

        div.append(image);
        div.append(section);
        $projects.append(div);
    }
}

$(async () => {
    let lastPage = localStorage.getItem('lastPage');
    if (lastPage == null) { lastPage = 0; }
    setPage(lastPage);
});