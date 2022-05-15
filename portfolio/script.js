const menuItems = document.querySelector(".menu-items");
const home = document.querySelector("#home");
const about = document.querySelector("#about");
const project = document.querySelector("#project");
const menuToggle = document.querySelector(".menu-toggle");
const hanbugerMenu = document.querySelector(".hanbuger-menu")
const menuliTag = document.querySelectorAll(".hanbuger-menu ul li");

menuToggle.addEventListener("click", (event) => {
    if (hanbugerMenu.classList.contains("showed")) {
        hanbugerMenu.classList.remove("showed");
        hanbugerMenu.style.opacity = "0";
        menuliTag.forEach(e => {
            e.classList.remove("menu-animation")
        })
    } else {
        hanbugerMenu.classList.add("showed");
        hanbugerMenu.style.opacity = "1";
        menuliTag.forEach(e => {
            e.classList.add("menu-animation")
        })
    }
})

menuliTag.forEach(e => {
    e.addEventListener("click", (event) => {
        let target = event.target.innerText;
        if (hanbugerMenu.classList.contains("showed")) {
            hanbugerMenu.classList.remove("showed");
            hanbugerMenu.style.opacity = "0";
            menuliTag.forEach(e => {
                e.classList.remove("menu-animation")
            })
        }
        if (target == "Home") {
            home.classList.remove('d-none');
            about.classList.add('d-none');
            project.classList.add('d-none');
        } else if (target == "About") {
            about.classList.remove('d-none');
            home.classList.add('d-none');
            project.classList.add('d-none');
        } else if (target == "Project") {
            project.classList.remove('d-none');
            about.classList.add('d-none');
            home.classList.add('d-none');
        }
    })
})

for (let i of menuItems.children) {
    i.addEventListener('click', (e) => {
        let element = e.target;
        let target = element.innerText.trim();
        console.log(target);
        if (target == "Home") {
            home.classList.remove('d-none');
            about.classList.add('d-none');
            project.classList.add('d-none');
        } else if (target == "About") {
            about.classList.remove('d-none');
            home.classList.add('d-none');
            project.classList.add('d-none');
        } else if (target == "Project") {
            project.classList.remove('d-none');
            about.classList.add('d-none');
            home.classList.add('d-none');
        }

        for (let j of menuItems.children) {
            if (j.innerText != element.innerText) {
                j.classList.remove('text-primary');
            } else {
                element.classList.add("text-primary");
            }
        }
    })
}