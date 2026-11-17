Git is one of those tools people learn by memorising five commands and hoping nothing goes wrong. That works until the first scary merge conflict or the first time someone says "just rebase it." This guide is what I wish I had been handed early on: the mental model first, then the commands you will use every week, then the situations that tend to cause panic and how to get out of them.

## 1. The mental model

Almost every Git confusion clears up once you can picture three places and a few pointers.

| Area | What it is | Commands that move things here |
|---|---|---|
| **Working tree** | The files on your disk right now | Editing, `git restore`, `git switch` |
| **Staging area (index)** | The snapshot you are preparing for the next commit | `git add`, `git restore --staged` |
| **Repository** | Every commit ever made, stored in `.git` | `git commit` |

A **commit** is a full snapshot of the project plus a pointer to its parent commit(s), an author and a message. Commits never change. When it looks like you "edited" a commit, Git actually made a new one.

A **branch** is just a movable label pointing at a commit. Creating a branch is cheap because it is literally a tiny file containing a commit ID.

**HEAD** is "where you are now." Usually it points at a branch, and that branch points at a commit.

A **remote** (usually called `origin`) is another copy of the repository, typically on GitHub. `origin/main` is your local record of where `main` was on the remote the last time you fetched.

Keep this picture in mind and commands stop feeling like spells.

## 2. One-time setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true          # rebase local work on pull instead of merge
git config --global rebase.autoStash true      # stash and restore uncommitted work around a rebase
git config --global merge.conflictStyle zdiff3 # show the common ancestor in conflicts
git config --global rerere.enabled true        # remember how you resolved a conflict
git config --global push.autoSetupRemote true  # first push sets the upstream automatically
```

Use an SSH key or the GitHub CLI (`gh auth login`) so you are not typing passwords.

## 3. The everyday loop

```bash
git switch main
git pull                      # get the latest
git switch -c feat/login-rate-limit

# ...edit files...
git status                    # what changed?
git diff                      # see unstaged changes
git add -p                    # stage hunk by hunk, review as you go
git diff --staged             # check exactly what you are about to commit
git commit -m "Add rate limiting to login endpoint"

git push                      # first push creates the remote branch
gh pr create --fill           # or open the PR on github.com
```

Two habits that pay off forever:

- **`git add -p`** instead of `git add .`. It forces you to look at every change, and it is how you catch the stray `console.log` and the debug password before they get committed.
- **`git diff --staged` before every commit.** Your commit is whatever is staged, not whatever you think you changed.

## 4. Reading history

```bash
git log --oneline --graph --decorate --all   # the whole picture, compactly
git log -p path/to/file                      # every change to one file, with diffs
git log -S "functionName"                    # commits that added or removed this text
git blame path/to/file                       # who last touched each line
git show <commit>                            # one commit in full
git diff main...feature                      # what feature adds since it branched off main
```

I alias the first one to `git lg`:

```bash
git config --global alias.lg "log --oneline --graph --decorate --all"
```

## 5. Branching

```bash
git branch                     # list local branches
git branch -a                  # include remote-tracking branches
git switch existing-branch     # move to a branch
git switch -c new-branch       # create and move
git branch -d old-branch       # delete a merged branch
git branch -D old-branch       # force delete an unmerged branch
git push origin --delete old-branch
git fetch --prune              # clean up remote branches that no longer exist
```

Name branches so a stranger can guess what they are: `feat/csv-export`, `fix/null-avatar-crash`, `chore/upgrade-django`. Keep them short-lived. A branch that lives for three weeks is a merge conflict that is still loading.

## 6. Merging

Merging combines the history of two branches.

```bash
git switch main
git merge feature
```

Two outcomes:

- **Fast-forward.** If `main` has not moved since you branched, Git just slides the `main` label forward. No new commit.
- **Merge commit.** If both branches have new commits, Git creates a commit with two parents that ties them together.

`git merge --no-ff feature` forces a merge commit even when a fast-forward was possible, which some teams like because it keeps a visible record of each feature.

On GitHub you will usually merge through a pull request, with three options:

| Button | Result | When I use it |
|---|---|---|
| Create a merge commit | All branch commits plus a merge commit | When the individual commits tell a useful story |
| Squash and merge | One commit on `main` for the whole PR | Default for most feature work. Clean history |
| Rebase and merge | Branch commits replayed on top of `main`, no merge commit | Small, well-crafted commit series |

## 7. Rebasing

Rebasing takes your commits and replays them on top of another commit, as if you had started your work from there.

```bash
git switch feature
git fetch origin
git rebase origin/main
```

Before:

```
      A---B---C  feature
     /
D---E---F---G    main
```

After:

```
              A'--B'--C'  feature
             /
D---E---F---G             main
```

`A'`, `B'` and `C'` are new commits with the same changes. That is why rebasing "rewrites history."

**The golden rule:** do not rebase commits that other people have based work on. Rebasing your own feature branch is fine. Rebasing `main` is not.

After rebasing a branch you already pushed, a normal push is rejected because the history changed. Use:

```bash
git push --force-with-lease
```

Never plain `--force`. `--force-with-lease` refuses if someone else pushed to the branch since you last fetched, so you cannot silently delete a teammate's work.

### Cleaning up your commits before review

Interactive rebase lets you reorder, combine, reword and drop commits:

```bash
git rebase -i origin/main
```

You get a list. Change `pick` to `squash`, `fixup`, `reword` or `drop`, save, and Git does the rest.

A tidier workflow for review feedback:

```bash
git commit --fixup <sha-of-commit-to-fix>
git rebase -i --autosquash origin/main
```

The fixup commit is automatically folded into the right place.

### Merge or rebase?

| | Merge | Rebase |
|---|---|---|
| History | True record, including when branches joined | Linear, easier to read |
| Safety | Never rewrites existing commits | Rewrites your branch's commits |
| Conflicts | Resolve once | May resolve per commit |
| Good for | Shared branches, integrating long-lived work | Updating your own feature branch |

My rule of thumb: **rebase to update your own branch, merge (or squash) to land it.**

## 8. Resolving conflicts

A conflict means two branches changed the same lines and Git will not guess which one wins. That is a feature, not an error.

```bash
git merge main          # or git rebase origin/main
# CONFLICT (content): Merge conflict in src/billing.py
git status              # lists conflicted files
```

Inside the file, with `zdiff3` enabled:

```
<<<<<<< HEAD
TAX_RATE = 0.20
||||||| base
TAX_RATE = 0.18
=======
TAX_RATE = 0.1925
>>>>>>> main
```

Read it as: the original was `0.18`, you changed it to `0.20`, they changed it to `0.1925`. Seeing the base is what makes the right answer obvious, which is why I turn `zdiff3` on.

Steps:

1. Open each conflicted file and decide what the code should actually be. Sometimes that is one side, often it is a combination.
2. Delete the markers.
3. Run the tests. A clean text merge can still be a broken program.
4. Mark it resolved and continue:

```bash
git add src/billing.py
git merge --continue     # or: git rebase --continue
```

Escape hatches:

```bash
git merge --abort        # go back to before the merge started
git rebase --abort       # same for rebase
git checkout --ours  path   # take your version (during a merge)
git checkout --theirs path  # take their version (during a merge)
```

Careful: during a **rebase**, "ours" and "theirs" are swapped, because Git is replaying your commits onto theirs. When in doubt, open the file and read it.

How to have fewer conflicts in the first place: small PRs, short-lived branches, rebasing on `main` daily, and not reformatting whole files in the same PR as a logic change.

## 9. Undoing things

This table is the one people bookmark.

| Situation | Command |
|---|---|
| Discard unstaged changes to a file | `git restore path` |
| Unstage a file, keep the changes | `git restore --staged path` |
| Fix the last commit's message or add a forgotten file | `git add file && git commit --amend` |
| Undo the last commit, keep changes staged | `git reset --soft HEAD~1` |
| Undo the last commit, keep changes unstaged | `git reset HEAD~1` |
| Throw away the last commit and its changes | `git reset --hard HEAD~1` |
| Undo a commit that is already pushed and shared | `git revert <sha>` |
| Get back something you "lost" | `git reflog`, then `git switch -c rescue <sha>` |

The rule: **`reset` and `amend` rewrite history, so use them only on commits nobody else has. `revert` adds a new commit that undoes an old one, so it is always safe on shared branches.**

`git reflog` is your safety net. It records every place `HEAD` has been, including commits you reset away. Almost nothing in Git is truly lost for about 90 days.

## 10. Stashing

When you need to switch branches with half-finished work:

```bash
git stash push -m "wip: half-done filter UI"
git switch hotfix-branch
# ...fix, commit, push...
git switch -
git stash pop
```

`git stash list` shows what you have. Stashes are easy to forget, so I prefer a quick `wip` commit on the branch when the work will sit for more than an hour.

## 11. Pull requests that get reviewed quickly

A PR is a request for someone else's time. Make it cheap to say yes.

- **Small.** Under roughly 400 changed lines gets real review. Two thousand lines gets "LGTM."
- **One purpose.** A bug fix, a feature slice, or a refactor. Not all three.
- **A description that answers three questions:** what changed, why, and how you tested it. Add screenshots for UI changes.
- **Self-review first.** Read your own diff on GitHub before requesting reviewers. You will find something.
- **Green checks before asking.** CI failing is not a review request.
- **Draft PRs** for early feedback on direction.

A template I use:

```markdown
## What
Adds rate limiting to the login endpoint (5 attempts per minute per IP and per account).

## Why
We saw credential-stuffing traffic on Nov 12. Closes #214.

## How I tested
- Unit tests for the limiter
- Manually hit the endpoint 6 times locally and confirmed the 429 + Retry-After

## Notes for reviewers
The limiter config lives in settings so ops can tune it without a deploy.
```

### Reviewing well

- Review the design first, style last. Let linters argue about formatting.
- Ask questions instead of issuing orders: "What happens if this list is empty?"
- Separate blocking comments from suggestions. Prefixing with `nit:` helps.
- Approve when it is better than what is on `main` and safe to ship, not when it is how you would have written it.

## 12. Team workflows

| Workflow | How it works | Fits |
|---|---|---|
| **GitHub flow** | `main` is always deployable. Short feature branches, PR, merge, deploy | Most web products and small teams |
| **Trunk-based** | Everyone integrates into `main` at least daily. Unfinished work hides behind feature flags | Teams with strong CI and frequent deploys |
| **Git flow** | `develop`, `release/*`, `hotfix/*` branches alongside `main` | Versioned software with scheduled releases, mobile apps with store review |

If you are not sure, start with GitHub flow plus branch protection on `main` (required reviews, required status checks, no direct pushes). Move to trunk-based once your test suite is good enough to trust.

## 13. Commit messages

Future you will read these during an incident at 2 a.m. Write for that person.

```
Fix double charge when payment webhook is retried

Stripe retries webhooks on timeout. We processed the event twice because
the idempotency check ran after the charge was recorded. Move the check
before any side effects and add a unique constraint on event_id.
```

- First line: imperative, around 50 characters, says what the commit does.
- Blank line, then the why. The diff already shows the what.
- If your team uses Conventional Commits (`feat:`, `fix:`, `chore:`), follow it so changelogs can be generated.

## 14. Handy extras

```bash
git bisect start
git bisect bad                 # current commit is broken
git bisect good v1.4.0         # this one worked
# Git checks out the midpoint; test, then mark good or bad until it finds the culprit
git bisect reset

git cherry-pick <sha>          # copy one commit onto the current branch
git worktree add ../hotfix main  # a second working directory on another branch
git clean -nd                  # preview untracked files that would be deleted
git clean -fd                  # actually delete them
```

And a sensible `.gitignore` from day one: dependencies (`node_modules/`, `.venv/`), build output, editor folders, and above all `.env` files. If a secret does get committed, **rotate the secret first**. Rewriting history afterwards is cleanup, not a fix, because the value is already in clones and forks.

## Quick reference

```bash
# start
git clone <url>                 git switch -c <branch>
# save
git add -p                      git commit -m "..."
# sync
git fetch                       git pull            git push
# integrate
git rebase origin/main          git merge <branch>
# inspect
git status   git diff   git diff --staged   git lg   git log -p <file>
# undo
git restore <file>   git restore --staged <file>   git commit --amend
git reset --soft HEAD~1   git revert <sha>   git reflog
```

Learn the model, keep branches small, look at what you are committing, and Git turns from something you fear into something you lean on.
