const menuItems = document.querySelector(".menu-items");
const home = document.querySelector("#home");
const about = document.querySelector("#about");

for (let i of menuItems.children) {
    i.addEventListener('click', (e) => {
        let element = e.target;
        let target = element.innerText.trim();
        if (target == "Home") {
            home.classList.remove('d-none');
            about.classList.add('d-none');
        } else if (target = "About") {
            about.classList.remove('d-none');
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