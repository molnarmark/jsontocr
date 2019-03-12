# JSON To Crystal

Generate Crystal JSON mappings from JSON files.

## Usage

```
npx jsontocr test.json types.cr
```

## Examples

Take this JSON for example:

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

Generated output will look like this:

```crystal
require "json"

class Root
  JSON.mapping(
    userId: {type: Float64, nilable: true},
    id: {type: Float64, nilable: true},
    title: {type: String, nilable: true},
    body: {type: String, nilable: true},
  )
end
```
