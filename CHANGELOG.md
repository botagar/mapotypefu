# [2.0.0](https://github.com/botagar/mapotypefu/compare/v1.1.1...v2.0.0) (2025-07-25)


### Code Refactoring

* remove legacy backend config support for cleaner API ([a094153](https://github.com/botagar/mapotypefu/commit/a094153e0f31a31ad4e180f3023e6b318024c473))


### Features

* add partial backend configuration support to init command ([d8a63f2](https://github.com/botagar/mapotypefu/commit/d8a63f222c82e3605504370eac0e71d8280312af))
* enhance backend config to support combining files and CLI args ([ec26d74](https://github.com/botagar/mapotypefu/commit/ec26d74e6e2739e8efe88521c52b9ed66fc82bcf))


### BREAKING CHANGES

* Remove backward compatibility for backendConfig parameter

- backendConfigFiles: string | string[] - explicit parameter for backend config files
- backendConfig: Record<string, string | number | boolean> - explicit parameter for CLI arguments
- Remove ambiguous backendConfig usage that supported both files and objects
- Simplify implementation by removing legacy handling logic
- Update all tests to use clean API (21 tests passing)
- Update documentation to remove legacy references
- Update examples to demonstrate clean API usage

This creates a cleaner, more explicit API where the purpose of each parameter
is clear and unambiguous. Since this is a single-user library, breaking
changes are acceptable for better API design.

## [1.1.1](https://github.com/botagar/mapotypefu/compare/v1.1.0...v1.1.1) (2025-07-25)


### Bug Fixes

* resolve pnpm version conflict in CI workflow ([6b8d95f](https://github.com/botagar/mapotypefu/commit/6b8d95f4f0344ebb3b1a7b468c58066d6d681ebc))

# [1.1.0](https://github.com/botagar/mapotypefu/compare/v1.0.2...v1.1.0) (2025-07-08)


### Features

* include additional files in npm package ([0bc9010](https://github.com/botagar/mapotypefu/commit/0bc9010e92aa78d57076ad86ecb544dc72c5e5a0))

## [1.0.2](https://github.com/botagar/mapotypefu/compare/v1.0.1...v1.0.2) (2025-06-30)


### Bug Fixes

* remove unnessesary workflows ([2c0a10e](https://github.com/botagar/mapotypefu/commit/2c0a10e67c87c226f7c2bafddce1ebd981ee6c06))

## [1.0.1](https://github.com/botagar/mapotypefu/compare/v1.0.0...v1.0.1) (2025-06-30)


### Bug Fixes

* publish to npm ([33578a5](https://github.com/botagar/mapotypefu/commit/33578a5f0006a9730479e28a5ccd6a7037c03eae))

# 1.0.0 (2025-06-30)


### Bug Fixes

* remove git push from postversion script to fix semantic-release ([f248381](https://github.com/botagar/mapotypefu/commit/f248381a3fe081c75cef9876eea9fed886fc96ce))
* update semantic-release configuration and workflow permissions ([5ff80da](https://github.com/botagar/mapotypefu/commit/5ff80da2a1d0d6e1ad7d2dfea787db89804bc139))


### Features

* add semantic-release for automatic versioning ([cfc56e8](https://github.com/botagar/mapotypefu/commit/cfc56e8b90d38e792a41908f98e663d6302dcfaa))
