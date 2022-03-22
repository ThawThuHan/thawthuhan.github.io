const box = document.querySelector(".box");
let yesButton = document.querySelector('#yes');
const noButton = document.querySelector("#no");
const restart = document.createElement("a");
const nope = new Audio();
const ohh = new Audio();
nope.src = "Nope.mp3";
ohh.src = "rap.mp3";

noButton.addEventListener('click', () => {
    let top = Math.round(Math.random() * 100);
    let left = Math.round(Math.random() * 100);
    let boxHeightPercentage = Math.round((box.offsetHeight / window.innerHeight) * 100);
    let boxWidthPercentage = Math.round((box.offsetWidth / window.innerWidth) * 100);
    if (top > boxHeightPercentage) {
        top = top - boxHeightPercentage;
    }
    if (left > boxWidthPercentage) {
        left = left - boxWidthPercentage;
    }
    box.style.transform = "none";
    box.style.top = top + "%";
    box.style.left = left + "%";
    nope.play();
})

yesButton.onclick = () => {
    box.firstElementChild.innerHTML = "I knew it! :3";
    box.style.top = "50%";
    box.style.left = "50%";
    box.style.transform = "translate(-50%, -50%)";
    box.lastElementChild.remove();
    restart.innerText = "Test again"
    restart.setAttribute("href", " ");
    box.appendChild(restart);
    ohh.play();
}