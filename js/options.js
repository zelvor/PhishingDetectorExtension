const btnOption = document.querySelector("#btn-option");

// Add a click event listener to the button
btnOption.addEventListener("click", () => {
  // Open a new tab with the option.html file
  chrome.tabs.create({ url: "options.html" });
});