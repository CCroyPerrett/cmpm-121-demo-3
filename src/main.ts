// todo
const alert_button = document.createElement("button");
document.body.append(alert_button);
alert_button.innerHTML = "alert";
alert_button.addEventListener("click", () => {
  alert("you clicked the button!");
});
