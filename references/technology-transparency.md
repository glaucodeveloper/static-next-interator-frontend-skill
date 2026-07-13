# Transparência tecnológica como estratégia para IA

## Sumário

1. Escolha estratégica
2. Uma chave de leitura compartilhada
3. Overhead que a transparência reduz
4. O que continua obrigatório
5. Critério de decisão

## 1. Escolha estratégica

Static Next escolhe mecanismos nativos e uma sequência causal visível para reduzir a distância entre intenção, geração, execução e revisão. Essa simplicidade não significa ausência de complexidade de produto; significa que a complexidade permanece no estado e nas regras do domínio, em vez de ser duplicada por uma camada tecnológica opaca.

Em produção assistida por IA, essa transparência é uma interface estratégica. O código não precisa ser traduzido para um segundo modelo mental antes de poder ser analisado. Estado, handlers, DOM, suspensão e atualização estão presentes na própria unidade que será executada.

## 2. Uma chave de leitura compartilhada

> O segredo de leitura da IA e o seu é o mesmo: seguir a linha do programa.

```text
estado atual
→ materialização inline do root
→ yield HTMLElement
→ next(StatePatch)
→ Object.assign(this.state, StatePatch)
→ próximo render
```

Essa chave permite que a pessoa autora, a pessoa revisora e a IA façam as mesmas perguntas no mesmo trecho:

- Qual estado foi lido?
- Qual root foi produzido?
- Qual método pode ser chamado pelo DOM?
- Qual patch o método envia?
- Onde o patch é aplicado?
- Qual elemento será substituído?

Não há uma resposta conceitual para a IA e outra resposta operacional escondida no runtime. A estrutura que explica é a estrutura que executa.

## 3. Overhead que a transparência reduz

### Overhead cognitivo

Reduzir conceitos intermediários, convenções implícitas e saltos entre arquivos para reconstruir uma única transição de estado.

### Overhead de contexto para IA

Reduzir a quantidade de documentação de framework, versões, plugins, transforms e regras de lifecycle que precisa entrar no contexto antes de uma alteração local poder ser produzida ou auditada.

### Overhead arquitetural

Evitar adapters, registries, wrappers de render, factories paralelas e abstrações que apenas transportam o mesmo estado entre camadas.

### Overhead de dependência

Diminuir a superfície sujeita a upgrades, incompatibilidades e mudanças de convenção. Isso não implica bundle ou runtime automaticamente menores; esses ganhos precisam de medição no produto real.

## 4. O que continua obrigatório

Transparência não substitui rigor. Código gerado ou alterado com IA ainda deve:

- validar `StatePatch` e propriedades;
- escapar conteúdo e argumentos dinâmicos;
- preservar foco, semântica e acessibilidade;
- tratar concorrência, teardown e falhas assíncronas;
- possuir testes proporcionais ao risco;
- ser revisado como código de produção.

A vantagem é que esses controles também ficam explícitos e podem ser inspecionados na mesma linha causal.

## 5. Critério de decisão

Prefira a solução que permite responder, lendo o componente isoladamente, como uma ação do usuário se transforma no próximo root. Introduza uma abstração adicional somente quando ela remover repetição ou risco real sem ocultar essa resposta.

Simplicidade aqui é capacidade de inspeção. A tecnologia permanece legível para quem escreve, para quem revisa e para a IA que colabora com ambos.
