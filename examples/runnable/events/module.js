const root = document.querySelector("#app");
const output = document.querySelector("#last-message");

function messageFrom(target) {
  const message = {
    type: target.dataset.message,
    sourceId: target.dataset.sourceId,
  };

  if (target.dataset.route !== undefined) {
    message.route = target.dataset.route;
  }

  if (target.dataset.value !== undefined) {
    message.value = target.dataset.value;
  } else if (target.matches("input, select, textarea")) {
    message.value = target.value;
  }

  if ("checked" in target) {
    message.checked = target.checked;
  }

  return message;
}

const interator = {
  messages: [],

  dispatch(message) {
    this.messages.push(message);
    output.textContent = JSON.stringify(message);
    return { changed: [], snapshot: {} };
  },
};

root.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const target = event.target.closest("[data-message]");

  if (!target || !root.contains(target)) return;
  interator.dispatch(messageFrom(target));
});

window.eventExample = interator;
