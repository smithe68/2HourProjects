async function getProjects() {
    const file = await fetch("projects.json");
    return (await file.json()).projects;
}

async function displayNotes(forceOn) {
    const $notes = $('.notes');
    const visible = $notes.is(":visible");
    $notes.toggle(forceOn ? true : !visible);

    if (visible) {
        $('.projects').empty();
        const proj = await getProjects();
        for (let i = 0; i < proj.length; i++) {
            const project = document.createElement('button');
            project.innerHTML = proj[i].name;
            project.addEventListener('click', () => {
                $('.notepad').html(proj[i].notes);
                $('.projects button').each((i, e) => {
                    e.disabled = false;
                })
                project.disabled = true;
            });

            if (i === 0) {
                project.disabled = true;
            }

            $(".projects").append(project);
        }
    }
}

displayNotes(true);