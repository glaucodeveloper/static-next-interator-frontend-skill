# Component Examples

Pure functional component as a DOM-returning iterator:

```js
const LabelComponent = ({ id, props = {} }) => ({
  id,
  element: null,

  next(message = {}) {
    const text = message.text ?? props.text ?? "";
    const template = document.createElement("template");

    template.innerHTML = `<span id="${id}">${text}</span>`;
    this.element = template.content.children[0];
    this.element.component = this;

    return {
      done: false,
      value: this.element,
    };
  },
});
```

Stateful component as a live object with `next(newState)`:

```js
function CounterComponent(id) {
  const title = "Contador";

  const actions = [
    { text: "+1", call: "addCountingState(1)" },
    { text: "+10", call: "addCountingState(10)" },
    { text: "set 100", call: "setCountingState(100)" },
    { text: "mudar label", call: "changeLabel('Estado alterado')" },
    { text: "reset", call: "resetState()" },
  ];

  const actionButtons = () =>
    actions
      .map(
        (action) => /*html*/ `
          <button onclick="document.getElementById('${id}').component.${action.call}">
            ${action.text}
          </button>
        `
      )
      .join("");

  return {
    id,
    state: {
      counting: 0,
      label: title,
    },
    element: null,

    next(newState = {}) {
      Object.assign(this.state, newState);

      const template = document.createElement("template");

      template.innerHTML = /*html*/ `
        <div id="${this.id}">
          <h2>${this.state.label}</h2>
          <span>${this.state.counting}</span>
          ${actionButtons()}
        </div>
      `.trim();

      this.element = ((element) =>
        this.element?.isConnected
          ? (
              this.element.replaceWith(
                (element.component = this, element)
              ),
              element
            )
          : (
              element.component = this,
              element
            )
      )(template.content.children[0]);

      return {
        value: this.element,
        done: false,
      };
    },

    addCountingState(number) {
      return this.next({
        counting: this.state.counting + number,
      });
    },

    setCountingState(number) {
      return this.next({
        counting: number,
      });
    },

    changeLabel(label) {
      return this.next({
        label,
      });
    },

    resetState() {
      return this.next({
        counting: 0,
        label: title,
      });
    },
  };
}

document.body.append(
  CounterComponent("counter-1").next().value
);
```
