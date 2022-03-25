const male = document.querySelector("#male");
const female = document.querySelector("#female");
const heightSlide = document.querySelector('#height');
const weightSlide = document.querySelector('#weight');
const heightNumber = document.querySelector(".height").firstElementChild;
const weightNumber = document.querySelector(".weight").firstElementChild;
const calculateBtn = document.querySelector("#calculate")

let gender = "male", height, weight;

height = heightSlide.value;
weight = weightSlide.value;

male.onclick = () => {
    gender = "male";
    if (!male.classList.contains("acitve")) {
        male.classList.add("active");
        female.classList.remove("active");
    }
};
female.onclick = () => {
    gender = "female";
    if (!female.classList.contains("acitve")) {
        female.classList.add("active");
        male.classList.remove("active");
    }
};

heightNumber.innerText = heightSlide.value + " inches";
weightNumber.innerText = weightSlide.value + " lb";

heightSlide.oninput = function () {
    heightNumber.innerText = heightSlide.value + " inches";
    height = heightSlide.value;
}

weightSlide.oninput = function () {
    weightNumber.innerText = weightSlide.value + " lb";
    weight = weightSlide.value;
}

calculateBtn.onclick = function () {
    const result = document.querySelector('.result');
    console.log();
    let bmi = (703 * weight) / (height ** 2);
    result.firstElementChild.innerHTML = bmi.toFixed(1);
}