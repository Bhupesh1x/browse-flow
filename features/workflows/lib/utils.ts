import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator"

export function generateUniqueName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    length: 2,
  })
}
