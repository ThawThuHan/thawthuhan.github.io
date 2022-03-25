const male = document.querySelector("#male");
const female = document.querySelector("#female");
const heightSlide = document.querySelector('#height');
const weightSlide = document.querySelector('#weight');
const heightNumber = document.querySelector(".height");
const weightNumber = document.querySelector(".weight");
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

heightNumber.value = heightSlide.value;
weightNumber.value = weightSlide.value;

heightSlide.oninput = function () {
    heightNumber.value = heightSlide.value;
    height = heightSlide.value;
}

heightNumber.oninput = () => {
    heightSlide.value = heightNumber.value;
    height = heightNumber.value;
}

weightSlide.oninput = function () {
    weightNumber.value = weightSlide.value;
    weight = weightSlide.value;
}

weightNumber.oninput = () => {
    weightSlide.value = weightNumber.value;
    weight = weightNumber.value;
}

calculateBtn.onclick = function () {
    const result = document.querySelector('.result');
    console.log();
    let bmi = (703 * weight) / (height ** 2);
    result.firstElementChild.innerHTML = bmi.toFixed(1);
}