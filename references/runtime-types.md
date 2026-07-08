# Runtime Type Contracts

Use runtime schemas for JavaScript-only frontends. Do not create `.d.ts` files unless the project uses TypeScript.

## Validator Set

```js
const Type = {
  string: value => typeof value === "string",
  number: value => typeof value === "number",
  boolean: value => typeof value === "boolean",
  object: value => value !== null && typeof value === "object",
  array: value => Array.isArray(value),
  fn: value => typeof value === "function",
  any: () => true
};
```

## Model Factory

Use `define(name, schema, methods)` for contracts that must validate construction, assignment, and unknown fields.

```js
function define(name, schema, methods = {}) {
  function Model(data = {}) {
    const state = {};

    for (const key in schema) {
      const validator = schema[key];

      if (key in data) {
        if (!validator(data[key])) {
          throw new TypeError(`${name}.${key} recebeu valor inválido`);
        }

        state[key] = data[key];
      } else {
        state[key] = undefined;
      }
    }

    let proxy;

    proxy = new Proxy(state, {
      get(target, key) {
        if (key in Model.prototype) {
          const value = Model.prototype[key];
          return typeof value === "function" ? value.bind(proxy) : value;
        }

        return target[key];
      },

      set(target, key, value) {
        if (!(key in schema)) {
          throw new TypeError(`${name}.${String(key)} não existe`);
        }

        if (!schema[key](value)) {
          throw new TypeError(`${name}.${String(key)} recebeu valor inválido`);
        }

        target[key] = value;
        return true;
      },

      deleteProperty() {
        throw new TypeError(`Não é permitido deletar propriedades de ${name}`);
      }
    });

    return proxy;
  }

  Object.assign(Model.prototype, methods);

  Model.typeName = name;
  Model.schema = schema;

  Model.is = value => {
    if (!value || typeof value !== "object") return false;

    for (const key in schema) {
      if (!schema[key](value[key])) return false;
    }

    return true;
  };

  return Model;
}
```

## Usage Pattern

Keep schemas and methods declarative.

```js
const UserType = {
  id: Type.number,
  name: Type.string,
  admin: Type.boolean
};

const UserMethods = {
  rename(name) {
    this.name = name;
    return this;
  },

  label() {
    return `${this.id}:${this.name}`;
  }
};

const User = define("User", UserType, UserMethods);
```

## Component Contract Example

```js
const Component = define("Component", {
  name: Type.string,
  element: Type.object,
  props: Type.object,
  render: Type.fn
}, {
  mount(target) {
    target.appendChild(this.element);
    return this;
  },

  update(props) {
    this.props = {
      ...this.props,
      ...props
    };

    this.render();
    return this;
  }
});
```

## Rules

- Treat schema as the runtime shape definition.
- Treat prototype methods as shared behavior.
- Treat proxy traps as runtime enforcement for get/set/delete.
- Use models for route definitions, messages, component descriptors, domain entities, and API payloads.
- Keep model constructors side-effect free; perform DOM and network effects in component methods or interators.
- Do not use runtime schemas as a replacement for server validation.
