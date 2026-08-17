# ADR-002: GitHub Actions Over Bitrise for CI/CD

## Status: Accepted

## Date: 2024-03-01

## Context

HabotConnect needs a CI/CD platform to automate testing, building, and deploying the React Native mobile app. The key requirements are:
1. Run unit, integration, and E2E tests on every PR
2. Build iOS (TestFlight) and Android (Play Store) releases
3. Integrate with code quality tools (ESLint, commitlint, Husky)
4. Support macOS runners for iOS builds

We evaluated GitHub Actions, Bitrise, and CircleCI.

## Decision

We chose **GitHub Actions** as our CI/CD platform, combined with **Fastlane** for build/deploy automation.

## Rationale

### 1. Native GitHub Integration

Our source code is hosted on GitHub. GitHub Actions provides:
- **Zero-config SCM integration** — triggers on push, PR, tags natively
- **PR comments** — CI results appear directly in the PR conversation
- **Branch protection rules** — require status checks before merge
- **Secrets management** — native encrypted secrets storage
- **CODEOWNERS** — automated review assignments

### 2. Cost Efficiency

| Feature | GitHub Actions | Bitrise |
|---------|---------------|---------|
| Free tier (public repos) | Unlimited | 200 builds/month |
| macOS runner | 10x Linux minutes | Included but limited |
| Self-hosted runners | Supported (free) | Not available |
| Concurrent jobs | 20 (free) | 1-3 (depends on plan) |

### 3. Flexibility

- **Matrix builds** — test on multiple Node.js versions, device configs
- **Composite actions** — reusable CI steps as actions
- **Marketplace** — 18,000+ pre-built actions
- **Custom runners** — can add dedicated macOS machines for iOS builds

### 4. Workflow as Code

Workflows are YAML files checked into the repo, providing:
- Version control for CI/CD configuration
- Code review for pipeline changes
- History and audit trail

## Consequences

- **Positive:** Seamless GitHub integration, no vendor lock-in for SCM.
- **Positive:** Cost-effective for open-source and small teams.
- **Positive:** Fastlane handles platform-specific build complexity.
- **Negative:** macOS runners cost 10x Linux minutes (mitigated by caching).
- **Negative:** No built-in mobile device farm (use Firebase Test Lab or AWS Device Farm separately).

## Alternatives Considered

### Bitrise
- Mobile-first CI with built-in device testing, but expensive at scale and locks you into their ecosystem.

### CircleCI
- Good general-purpose CI, but less GitHub-native and requires more configuration for mobile builds.
