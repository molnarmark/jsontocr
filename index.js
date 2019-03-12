// #!/usr/bin/env node
const fs = require('fs');
const capitalize = require('capitalize');

class CrystalObject {
  constructor(name, rawChildren) {
    this.name = name;
    this.rawChildren = rawChildren;
    this.childNodes = [];
    processedTypes.push(name);
  }

  addChildNode(node) {
    this.childNodes.push(node);
  }

  toString() {
    const lines = [];
    for (const childNode of this.childNodes) {
      lines.push(childNode.toString());
    }

    return `
class ${capitalize(this.name)}
  JSON.mapping(\n    ${lines.join('\n    ')}
  )
end`;
  }
}

class CrystalProperty {
  constructor(name, type, isArray) {
    this.name = name;
    this.type = type;

    if (this.type === 'number') {
      this.type = 'float64';
    }

    this.isArray = isArray ? true : false;
  }

  toString() {
    let defLine;
    if (this.isArray) {
      defLine = `${this.name}: {type: Array(${capitalize(
        this.type
      )}), nilable: true},`;
    } else {
      defLine = `${this.name}: {type: ${capitalize(
        this.type
      )}, nilable: true},`;
    }
    return defLine;
  }
}

function convertProperty(name, value, arrayOf) {
  if (typeof value === 'object') {
    const obj = new CrystalObject(name, Object.entries(value));
    processObject(obj);
    crystalTypes.push(obj);

    return new CrystalProperty(name, name, arrayOf);
  }

  if (arrayOf) {
    return new CrystalProperty(name, typeof value, true);
  } else {
    return new CrystalProperty(name, typeof value);
  }
}

function processObject(object) {
  for (const rawChild of object.rawChildren) {
    const [name, value] = rawChild;
    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        const convertedProperty = convertProperty(
          name,
          arrayValue,
          typeof arrayValue
        );
        const childNodeNames = object.childNodes.map(node => node.name);
        if (childNodeNames.indexOf(name) <= -1) {
          object.addChildNode(convertedProperty);
        }
      }
    } else {
      const convertedProperty = convertProperty(name, value);
      object.addChildNode(convertedProperty);
    }
  }
}

const crystalTypes = [];
const processedTypes = [];

(async () => {
  const inputFile = process.argv[2];

  if (!inputFile) {
    return console.error('Input file must be specified.');
  }

  let contents;
  try {
    contents = JSON.parse(fs.readFileSync(inputFile).toString());
  } catch (e) {
    return console.error(e);
  }

  try {
    let entries = Object.entries(contents);
    if (Array.isArray(contents)) {
      entries = Object.entries(
        JSON.parse(`{"data": ${JSON.stringify(contents)}}`)
      );
    }

    const rootObject = new CrystalObject('Root', entries);
    crystalTypes.push(rootObject);
    processObject(rootObject);

    const uniqueTypes = [...new Set(crystalTypes.map(type => type.toString()))];
    const mappings = `require "json"\n${uniqueTypes.join('\n')}`;
    console.log(mappings);
  } catch (e) {
    return console.error(e);
  }
})();
