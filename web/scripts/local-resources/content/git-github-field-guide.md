Git is often learned as five memorised commands and a hope that nothing goes wrong. That holds until the first scary merge conflict, or the first time someone says "just rebase it." This guide starts with the mental model that makes the commands make sense, then covers the commands used every week, then the situations that tend to cause panic and how to get out of them.

Each chapter can be read on its own. The figures are worth more than the prose: if a command ever feels like a spell, go back to Figure 1 and find where it moves things.

> [!NOTE]
> Commands target Git 2.37 or later, which includes `git switch`, `git restore`, the `zdiff3` conflict style and `push.autoSetupRemote`. Check yours with `git --version`. Branch names, commit messages and pull request text in the examples are illustrative.

## 1. The mental model

Almost every Git confusion clears up once you can picture four places and a few labels.

```figure
git-areas
```

- The **working tree** is the files on your disk right now.
- The **staging area** (also called the index) is the snapshot you are preparing for the next commit.
- The **local repository** is every commit, stored in the `.git` folder.
- A **remote**, usually called `origin`, is another copy of the repository, typically on GitHub.

A **commit** is a full snapshot of the project plus a pointer to its parent commit or commits, an author and a message. Commits never change. When it looks as if you "edited" a commit, Git made a new one and moved a label to it.

A **branch** is that label: a movable name pointing at one commit. Creating a branch is cheap because it is little more than a file containing a commit ID. **HEAD** means "where you are now." Usually it points at a branch, and the branch points at a commit. `origin/main` is your local record of where `main` was on the remote the last time you fetched.

## 2. One-time setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true           # rebase local work on pull instead of merging
git config --global rebase.autoStash true       # stash and restore uncommitted work around a rebase
git config --global merge.conflictStyle zdiff3  # show the common ancestor in conflicts
git config --global rerere.enabled true         # reuse a recorded conflict resolution
git config --global push.autoSetupRemote true   # first push sets the upstream automatically
```

`pull.rebase` is a preference rather than a rule. It keeps your local commits on top of what you pulled instead of adding a merge commit every time you sync, which is what most people want on a personal feature branch.

Authenticate with an SSH key or the GitHub CLI (`gh auth login`) rather than typing a password. GitHub does not accept account passwords for Git operations over HTTPS.

## 3. The everyday loop

```bash
git switch main
git pull                       # get the latest
git switch -c feat/login-rate-limit

# ...edit files...
git status                     # what changed?
git diff                       # unstaged changes
git add -p                     # stage hunk by hunk, reviewing as you go
git diff --staged              # exactly what you are about to commit
git commit -m "Add rate limiting to the login endpoint"

git push                       # first push creates the remote branch
gh pr create --fill            # or open the pull request on github.com
```

Two habits that pay off for the rest of your career:

- **`git add -p` instead of `git add .`** It shows every change before it is staged, which is where a stray debug print or a hard-coded password gets caught.
- **`git diff --staged` before every commit.** A commit contains what is staged, not what you remember changing.

## 4. Reading history

```bash
git log --oneline --graph --decorate --all   # the whole picture, compactly
git log -p path/to/file                      # every change to one file, with diffs
git log -S "functionName"                    # commits that added or removed this text
git blame path/to/file                       # who last touched each line
git show <commit>                            # one commit in full
git diff main...feature                      # what feature adds since it branched from main
```

The first command is long enough to deserve an alias:

```bash
git config --global alias.lg "log --oneline --graph --decorate --all"
```

> [!TIP]
> The three dots in `main...feature` matter. With three dots, `git diff` compares `feature` with the point where it split from `main`, which is what a pull request shows. With two dots it compares the two branch tips directly, including everything that landed on `main` since.

## 5. Branching

```bash
git branch                     # list local branches
git branch -a                  # include remote-tracking branches
git switch existing-branch     # move to a branch
git switch -c new-branch       # create and move
git branch -d old-branch       # delete a merged branch
git branch -D old-branch       # force delete an unmerged branch
git push origin --delete old-branch
git fetch --prune              # drop remote-tracking refs for deleted remote branches
```

Name branches so a stranger can guess what they hold: `feat/csv-export`, `fix/null-avatar-crash`, `chore/upgrade-django`. Keep them short-lived. Every day a branch lives, `main` moves further away from it, and the eventual merge gets larger.

## 6. Merging

Merging combines the histories of two branches.

```bash
git switch main
git merge feature
```

There are two possible outcomes:

- **Fast-forward.** If `main` has not moved since you branched, Git slides the `main` label forward to your latest commit. No new commit is created.
- **Merge commit.** If both branches have new commits, Git creates a commit with two parents that ties them together.

`git merge --no-ff feature` forces a merge commit even when a fast-forward was possible. Some teams prefer that because it leaves a visible record of each piece of work landing.

## 7. Rebasing

Rebasing takes your commits and replays them on top of another commit, as if you had started your work from there.

```bash
git switch feature
git fetch origin
git rebase origin/main
```

```figure
git-merge-rebase
```

The replayed commits contain the same changes but are new commits with new IDs. That is what people mean when they say rebasing "rewrites history."

> [!WARNING]
> Do not rebase commits that other people have based work on. Rebasing your own feature branch is fine. Rebasing `main`, or a branch a teammate has pulled, leaves their copy pointing at commits that no longer exist on the remote.

After rebasing a branch you have already pushed, a normal push is rejected because the history changed. Use:

```bash
git push --force-with-lease
```

Avoid plain `--force`. `--force-with-lease` refuses to push if the remote branch has moved since you last fetched, so a teammate's commit cannot be silently overwritten.

### Cleaning up your commits before review

Interactive rebase lets you reorder, combine, reword and drop commits:

```bash
git rebase -i origin/main
```

Git opens a list of your commits. Change `pick` to `squash`, `fixup`, `reword` or `drop`, save, and Git does the rest.

For review feedback there is a tidier workflow:

```bash
git commit --fixup <sha-of-commit-to-fix>
git rebase -i --autosquash origin/main
```

The fixup commit is folded into the commit it fixes automatically.

### Merge or rebase?

A rule of thumb that works for most teams: **rebase to update your own branch, merge or squash to land it.** Rebasing keeps your branch current without merge noise; merging into `main` never rewrites anything other people depend on.

## 8. Resolving conflicts

A conflict means two branches changed the same lines and Git will not guess which version should win. That is a feature, not an error.

```bash
git merge main          # or: git rebase origin/main
# CONFLICT (content): Merge conflict in src/billing.py
git status              # lists conflicted files
```

```figure
git-conflict
```

Read the example as: the original rate was `0.18`, you changed it to `0.20`, and the other branch changed it to `0.1925`. Seeing the original is what makes the right answer obvious, which is why the `zdiff3` setting from chapter 2 is worth turning on.

1. Open each conflicted file and decide what the code should actually be. Sometimes that is one side; often it is a combination.
2. Delete the marker lines.
3. Run the tests. A clean text merge can still be a broken program.
4. Mark the file resolved and continue:

```bash
git add src/billing.py
git merge --continue     # or: git rebase --continue
```

Escape hatches:

```bash
git merge --abort              # back to before the merge started
git rebase --abort             # the same for a rebase
git checkout --ours   <path>   # take the version from HEAD
git checkout --theirs <path>   # take the incoming version
```

> [!WARNING]
> During a **rebase**, "ours" and "theirs" swap meaning. Git is replaying your commits onto the other branch, so `HEAD` (ours) is the other branch and your own commit is "theirs." When in doubt, open the file and read it.

Fewer conflicts come from small pull requests, short-lived branches, rebasing onto `main` often, and never reformatting a whole file in the same pull request as a logic change.

## 9. Undoing things

The right command depends on one question: has anyone else got this change yet?

```figure
git-undo
```

The rule behind the figure: **`reset` and `--amend` rewrite history, so use them only on commits nobody else has. `revert` adds a new commit that undoes an old one, so it is always safe on shared branches.**

`git reflog` is the safety net. It records every position `HEAD` has had, including commits you reset or rebased away. By default, reflog entries are kept for 90 days, and entries for commits no longer reachable from any branch for 30 days, before garbage collection may remove them.

```bash
git reflog                      # find the commit you want back
git switch -c rescue <sha>      # put a branch on it
```

## 10. Stashing

When you need to switch branches with half-finished work:

```bash
git stash push -m "wip: half-done filter UI"
git switch hotfix-branch
# ...fix, commit, push...
git switch -
git stash pop
```

`git stash list` shows what is stashed. Stashes are easy to forget about, so for work that will sit for more than a short while, a `wip` commit on its own branch is often safer. You can reword or squash it later.

## 11. Pull requests that get reviewed quickly

A pull request is a request for someone else's time. Make it cheap to say yes.

```figure
git-pr-merge
```

- **Small.** Reviewers read small changes carefully and skim large ones. Google's published engineering practices describe about 100 changed lines as usually reasonable and 1,000 as usually too large.
- **One purpose.** A bug fix, a slice of a feature, or a refactor. Not all three.
- **A description that answers three questions:** what changed, why, and how it was tested. Add screenshots for UI changes.
- **Self-review first.** Read your own diff on GitHub before requesting reviewers.
- **Green checks before asking.** A failing build is not ready for review.
- **Draft pull requests** for early feedback on direction.

A description template:

```markdown
## What
Adds rate limiting to the login endpoint (5 attempts per minute per IP and per account).

## Why
Repeated failed logins from single addresses show up in the auth logs. Closes #214.

## How I tested
- Unit tests for the limiter
- Sent 6 requests locally and confirmed the 429 with Retry-After

## Notes for reviewers
The limits live in settings so they can be tuned without a deploy.
```

### Reviewing well

- Review the design first and style last. Let formatters and linters handle formatting.
- Ask questions instead of issuing orders: "What happens if this list is empty?"
- Separate blocking comments from suggestions. Prefixing optional ones with `nit:` helps.
- Approve when the change makes the codebase better and is safe to ship, not when it matches how you would have written it.

## 12. Team workflows

```figure
git-workflows
```

Git flow also uses `hotfix/*` branches, cut from `main` for urgent fixes and merged back into both `main` and `develop`.

If you are unsure, start with GitHub flow and protect `main` with a branch protection rule or ruleset: required reviews, required status checks, no direct pushes. The author of the original Git flow model has himself recommended simpler workflows such as GitHub flow for software that is delivered continuously.

## 13. Commit messages

The person reading a commit message is often debugging an incident under pressure. Write for them.

```text
Fix double charge when a payment webhook is retried

The payment provider retries webhooks on timeout. The event was processed
twice because the duplicate check ran after the charge was recorded. Move
the check before any side effects and add a unique constraint on event_id.
```

- First line: imperative mood, around 50 characters, saying what the commit does.
- A blank line, then the why. The diff already shows the what.
- If your team uses [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`), follow it so changelogs and version numbers can be generated.

## 14. Handy extras

```bash
git bisect start
git bisect bad                 # the current commit is broken
git bisect good v1.4.0         # this one worked
# Git checks out the midpoint; test it, mark good or bad, repeat until it names the culprit
git bisect reset

git cherry-pick <sha>          # copy one commit onto the current branch
git worktree add ../hotfix -b hotfix/crash origin/main   # a second working directory on a new branch
git clean -nd                  # preview untracked files that would be deleted
git clean -fd                  # delete them
```

Start every repository with a sensible `.gitignore`: dependencies (`node_modules/`, `.venv/`), build output, editor folders and, above all, `.env` files.

> [!WARNING]
> If a secret is committed, **revoke or rotate it first.** Rewriting history afterwards is cleanup, not a fix: the value is already in other clones, forks and possibly caches.

## Checklist

- [ ] Work happens on a short-lived, clearly named branch
- [ ] Changes are staged with `git add -p` and checked with `git diff --staged`
- [ ] Commit messages say what and why
- [ ] The branch is rebased on current `main` before review
- [ ] The pull request is small, has one purpose, and explains how it was tested
- [ ] CI passes before reviewers are requested
- [ ] Shared branches are never rebased or force-pushed
- [ ] `main` is protected by required reviews and status checks
- [ ] `.gitignore` covers dependencies, build output and secrets

Learn the model, keep branches small, look at what you are committing, and Git stops being something to fear.

## References and further reading

### Official documentation

- [Git reference manual](https://git-scm.com/docs). Every command, every option.
- [Pro Git, 2nd edition](https://git-scm.com/book/en/v2) by Scott Chacon and Ben Straub. Free online; chapters 2, 3 and 7 cover most of this guide.
- [git-rebase documentation](https://git-scm.com/docs/git-rebase), including interactive mode and `--autosquash`.
- [git-reflog](https://git-scm.com/docs/git-reflog) and [git-gc](https://git-scm.com/docs/git-gc) for how long history is kept.
- [git-config: merge.conflictStyle](https://git-scm.com/docs/git-config#Documentation/git-config.txt-mergeconflictStyle) and [git-rerere](https://git-scm.com/docs/git-rerere).

### GitHub

- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [About merge methods on GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github)
- [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) and [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitHub CLI manual](https://cli.github.com/manual/)

### Practice and workflow

- [Google Engineering Practices: Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html) and [How to do a code review](https://google.github.io/eng-practices/review/reviewer/)
- [Vincent Driessen: A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/). The original Git flow article, with its 2020 note of reflection.
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

## Quick reference

A one-page summary of the commands in this guide. In the PDF edition it sits on its own page so it can be printed and kept nearby.

```figure
git-quick-reference
```
