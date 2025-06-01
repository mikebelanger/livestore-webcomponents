# Todo Example

My variant of [Livestore's webcomponents template.](https://docs.livestore.dev/reference/framework-integrations/custom-elements/)

This varies from the above in terms of:
* No shadow DOM - custom elements can render regular "light" DOM fine,
* Stronger separation of concerns - all the HTML into separate files,  components into their own files, etc,
* Replaced Tailwind with Pico.css, which is more lightweight and easier to reason about.,
* Made the components themselves more repurpose able, meaning all the Livestore stuff is separate from the component, and passed in as callbacks in a configure method.

## Running locally

```bash
bun
bun dev
```
