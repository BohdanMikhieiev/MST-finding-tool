export function removeAllActiveButtons() {
    const buttons = document.querySelectorAll(".activable-button");
    buttons.forEach(button => {
        button.classList.remove("active");
    });
}

export function disableButtons() {
    const buttons = document.querySelectorAll(".activable-button");
    buttons.forEach(button => {
        button.classList.add("disable");
    });
}

export function enableButtons() {
    const buttons = document.querySelectorAll(".activable-button");
    buttons.forEach(button => {
        button.classList.remove("disable");
    });
}