# Title

Using Git Hooks with Husky for Pre-commit and Pre-push Automation

## Status

- Proposed (2025-05-22)

## Context

We aim to enforce code quality checks (such as linting, formatting, and running tests) before commits and pushes to maintain consistent code quality before the code is even pushed to GitHub. Often, developers forget or skip running these checks manually, leading to inconsistent code, failing tests, and issues in the CI/CD pipeline. Automating these processes ensures better quality code at every step.

Additionally, ensuring that commit messages follow a **conventional commit message** format is essential for maintainability, easier changelogs, and better automation. Currently, there is no strict enforcement in place to guarantee developers follow this format.

## Decision

We will implement Git hooks using **Husky** to automate pre-commit and pre-push checks:

- **Pre-commit**: Automatically run **ESLint**, **Prettier**, and other code quality checks before committing the code.
- **Pre-push**: Run **Jest** tests to ensure no broken code is pushed to the repository.
- **Commit-msg**: Enforce **conventional commit messages** by integrating **commitlint**. This will ensure that commit messages follow a consistent format for easier tracking and automation (e.g., generating changelogs, versioning).

Husky will be configured along with **lint-staged** to ensure that only staged files are checked, improving efficiency.

## Consequences

### Positive Consequences

- **Improved code quality**: Automatically catch issues early (linting, formatting, and tests) before commits or pushes.
- **Consistency**: Enforces uniform coding standards across the team without relying on manual checks.
- **Faster feedback**: Developers will receive immediate feedback on code issues before pushing, reducing the chance of broken builds in CI.
- **Enforced commit message standards**: Ensures that all commit messages follow the conventional commit format, improving readability, traceability, and easier automation of versioning and changelog generation.

### Negative Consequences

- **Initial setup**: Configuring Husky, linting, formatting, testing tools, and commit message checks will require effort.
- **Performance overhead**: Depending on the number of tasks in the pre-commit and pre-push hooks, this could slow down the commit/push process, especially on large codebases or slow tests.
- **Commit message rigidity**: Developers may initially feel constrained by the requirement for commit message formatting, especially when the project has not previously enforced this structure.

### Trade-offs

While it will slow down commits or pushes slightly, the benefits of preventing broken code and improving team collaboration through automated checks far outweigh the minor delay.

There’s a trade-off between the initial setup cost and long-term time savings and code quality improvements.

Additionally, enforcing conventional commit messages enhances the long-term maintainability and automation of the project, which is invaluable in a larger team or more complex codebase.
