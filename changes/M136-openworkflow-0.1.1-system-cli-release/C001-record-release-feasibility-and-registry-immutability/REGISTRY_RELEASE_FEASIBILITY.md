# M136 C001 Registry Release Feasibility

## Finding

`@tiic-tech/openworkflow@0.1.1` already exists on npm.

Registry metadata:

- Version: `0.1.1`
- Tarball: `https://registry.npmjs.org/@tiic-tech/openworkflow/-/openworkflow-0.1.1.tgz`
- Registry gitHead: `b460bca063aa3c67855dd0f7512613c70c0f6195`
- Published at: `2026-05-19T09:30:38.852Z`

Current main after M134/M135 merge:

- Head: `4dc361454472fa0a1c06a84d527a49548ab0bf8e`
- Package version: `0.1.1`

## Decision

Do not run `npm publish` for `0.1.1`. npm package versions are immutable after publication; the
current main build cannot replace the existing registry artifact under the same version.

M136 will make the current `0.1.1` build available through the system-level local CLI by installing
from the repository. A later public registry release of the current capability surface needs a new
version number, such as `0.1.2`.
