import YAML from "yaml";

export function dumpYaml(value: unknown): string {
  return YAML.stringify(value, {
    collectionStyle: "block",
    lineWidth: 100,
    nullStr: "null",
  });
}

export function parseYaml(text: string): unknown {
  return YAML.parse(text);
}

