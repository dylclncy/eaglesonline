const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  contactStatus.textContent = "message staged locally - connect an endpoint to send";
  contactForm.reset();
});
