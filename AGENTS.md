 # Repository skills

Project-maintained skills live in `.cursor/skills/`. Treat each directory containing a
`SKILL.md` as an available repository skill, regardless of the `.cursor` directory
name.

Before acting on a request, compare it with the skill names and the YAML `description`
in each `SKILL.md`. When a skill is named by the user or clearly applies:

1. Read that skill's `SKILL.md` completely before taking task actions.
2. Follow its instructions and read only the supporting references it routes to.
3. Announce the selected skill briefly to the user.
4. Use the smallest set of applicable skills; do not load or combine every skill for
   every task.

Direct user instructions and higher-priority Codex instructions override repository
skills. A skill never expands authorization for destructive actions, external writes,
or delegation. Ignore skills found under generated or dependency directories such as
`node_modules`.

## Available skills

- `using-superpowers`: repository-level skill discovery and routing.
- `systematic-debugging`: investigate failures and identify root causes.
- `test-driven-development`: implement behavior through tests first.
- `verification-before-completion`: verify evidence before claiming completion.
- `requesting-code-review`: prepare completed work for review.
- `receiving-code-review`: assess and apply review feedback carefully.
- `subagent-driven-development`: coordinate delegated implementation only when
  delegation is permitted and appropriate.
- `speckit-constitution`: create or revise project development principles.
- `speckit-specify`: create or update a feature specification.
- `speckit-clarify`: resolve important specification ambiguities.
- `speckit-plan`: produce an implementation plan from a specification.
- `speckit-tasks`: generate an actionable task breakdown.
- `speckit-analyze`: check consistency across specification artifacts.
- `speckit-checklist`: create requirement-quality checklists.
- `speckit-converge`: reconcile competing approaches or unresolved decisions.
- `speckit-implement`: execute tasks from the Spec Kit workflow.
- `speckit-taskstoissues`: convert task definitions into issue-ready items.

This catalog is a discovery aid. The corresponding `SKILL.md` is authoritative and
must be read at use time because its contents may change.
