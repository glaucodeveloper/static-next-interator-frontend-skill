# Runtime Type Contracts

## Sumario

- [Defina validadores](#defina-validadores)
- [Crie modelos estritos](#crie-modelos-estritos)
- [Use o modelo](#use-o-modelo)
- [Valide componentes](#valide-componentes)
- [Mantenha os limites](#mantenha-os-limites)

Use schemas de runtime para validar dados recebidos e mutacoes em JavaScript. Trate-os como complemento de JSDoc, `checkJs`, TypeScript ou `.d.ts`, nao como substituto automatico de tipagem estatica.

## Defina validadores

```js
const isRecord = value =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const Type = {
  string: value => typeof value === "string",
  number: value => typeof value === "number" && Number.isFinite(value),
  boolean: value => typeof value === "boolean",
  record: isRecord,
  array: value => Array.isArray(value),
  fn: value => typeof value === "function",
  any: () => true,
  literal: expected => value => Object.is(value, expected),
  nullable: validator => value => value === null || validator(value),
  optional: validator => value => value === undefined || validator(value),
  arrayOf: validator => value =>
    Array.isArray(value) && value.every(validator),
  element: value =>
    typeof Element !== "undefined" && value instanceof Element,
  shape: (schema, { allowUnknown = false } = {}) => value => {
    if (!isRecord(value)) return false;

    if (
      !allowUnknown &&
      Object.keys(value).some(key => !Object.hasOwn(schema, key))
    ) {
      return false;
    }

    return Object.entries(schema).every(
      ([key, validator]) => validator(value[key])
    );
  },
};
```

Faca validadores obrigatorios rejeitarem `undefined`. Envolva campos opcionais com `Type.optional()` e campos anulaveis com `Type.nullable()`.

## Crie modelos estritos

Use `define(name, schema, methods)` quando precisar validar construcao, atribuicao e propriedades desconhecidas.

```js
function define(name, schema, methods = {}) {
  const schemaKeys = Object.keys(schema);

  for (const key of schemaKeys) {
    if (typeof schema[key] !== "function") {
      throw new TypeError(`${name}.${key} precisa de um validator`);
    }
  }

  for (const key of Object.keys(methods)) {
    if (Object.hasOwn(schema, key)) {
      throw new TypeError(`${name}.${key} nao pode ser campo e metodo`);
    }
  }

  function Model(data = {}) {
    if (!isRecord(data)) {
      throw new TypeError(`${name} precisa receber um objeto`);
    }

    for (const key of Object.keys(data)) {
      if (!Object.hasOwn(schema, key)) {
        throw new TypeError(`${name}.${key} nao existe`);
      }
    }

    const state = {};

    for (const key of schemaKeys) {
      const value = data[key];

      if (!schema[key](value)) {
        throw new TypeError(`${name}.${key} recebeu valor invalido`);
      }

      state[key] = value;
    }

    Object.setPrototypeOf(state, Model.prototype);

    let proxy;
    proxy = new Proxy(state, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);

        if (
          typeof key === "string" &&
          Object.hasOwn(methods, key) &&
          typeof value === "function"
        ) {
          return value.bind(proxy);
        }

        return value;
      },

      set(target, key, value, receiver) {
        if (typeof key !== "string" || !Object.hasOwn(schema, key)) {
          throw new TypeError(`${name}.${String(key)} nao existe`);
        }

        if (!schema[key](value)) {
          throw new TypeError(`${name}.${key} recebeu valor invalido`);
        }

        return Reflect.set(target, key, value, receiver);
      },

      deleteProperty() {
        throw new TypeError(`Nao e permitido deletar propriedades de ${name}`);
      },
    });

    return proxy;
  }

  Object.assign(Model.prototype, methods);
  Model.typeName = name;
  Model.schema = Object.freeze({ ...schema });
  Model.is = value => {
    if (!isRecord(value)) return false;
    if (Object.keys(value).some(key => !Object.hasOwn(schema, key))) return false;
    return schemaKeys.every(key => schema[key](value[key]));
  };

  return Model;
}
```

## Use o modelo

```js
const User = define(
  "User",
  {
    id: Type.number,
    name: Type.string,
    admin: Type.boolean,
    nickname: Type.optional(Type.string),
  },
  {
    rename(name) {
      this.name = name;
      return this;
    },

    label() {
      return `${this.id}:${this.name}`;
    },
  }
);

const user = new User({
  id: 1,
  name: "Icaro",
  admin: true,
});
```

Espere que `new User({ name: "Icaro", admin: true })` rejeite o `id` ausente. Espere tambem que campos extras na construcao ou atribuicao lancem `TypeError`.

## Valide componentes

Valide o contrato base permitindo metodos de dominio adicionais:

```js
const NextResult = Type.shape({
  value: Type.element,
  done: Type.literal(false),
});

const NextableComponent = Type.shape(
  {
    id: Type.string,
    state: Type.optional(Type.record),
    element: Type.nullable(Type.element),
    next: Type.fn,
    connect: Type.optional(Type.fn),
    dispose: Type.optional(Type.fn),
  },
  { allowUnknown: true }
);

if (!NextableComponent(component)) {
  throw new TypeError("Componente invalido");
}

const result = component.next();

if (!NextResult(result)) {
  throw new TypeError("next() retornou um resultado invalido");
}
```

Use `Type.optional(Type.record)` para permitir componentes stateless e `Type.nullable(Type.element)` para aceitar `element: null` antes da primeira renderizacao.

## Mantenha os limites

- Rejeite campos desconhecidos na construcao e na mutacao de modelos estritos.
- Modele obrigatoriedade, opcionalidade e nulabilidade separadamente.
- Nao aceite `NaN` ou infinito como numero de dominio por padrao.
- Nao trate arrays como records.
- Nao substitua validacao do servidor por contratos do cliente.
- Nao coloque efeitos DOM ou de rede no construtor de modelos.
