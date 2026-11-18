import { FigureFrame, Tag } from "./frame";
import { SequenceDiagram } from "./sequence-diagram";
import { CommitGraph } from "./commit-graph";

type FigureProps = { number?: number };

/* ------------------------------------------------------------------ */
/* 1. Where changes live                                               */
/* ------------------------------------------------------------------ */

export function GitAreasFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="git-areas"
      number={number}
      wide
      title="Where a change lives, and the commands that move it"
      caption={
        <>
          <code>git pull</code> is <code>git fetch</code> followed by a merge or a rebase of the
          fetched branch into yours. <code>git fetch</code> on its own only updates remote-tracking
          refs such as <code>origin/main</code>, so it is always safe to run.
        </>
      }
    >
      <SequenceDiagram
        ariaLabel="Commands moving changes between the working tree, the staging area, the local repository and the remote"
        participants={[
          { id: "wt", label: "Working tree", sub: "files on disk" },
          { id: "idx", label: "Staging area", sub: "the index" },
          { id: "repo", label: "Local repository", sub: "commits in .git" },
          { id: "remote", label: "Remote", sub: "origin on GitHub" },
        ]}
        steps={[
          { from: "wt", to: "idx", label: "git add -p", detail: "choose what goes in the next commit" },
          { from: "idx", to: "repo", label: "git commit", detail: "records a snapshot, moves the branch" },
          { from: "repo", to: "remote", label: "git push", detail: "shares your commits" },
          { from: "remote", to: "repo", label: "git fetch", detail: "updates origin/main, nothing else", kind: "response" },
          { from: "repo", to: "wt", label: "git switch · git merge · git rebase", detail: "updates the files you see", kind: "response" },
          { from: "repo", to: "idx", label: "git restore --staged <file>", detail: "unstage: index entry back to HEAD", kind: "response" },
          { from: "idx", to: "wt", label: "git restore <file>", detail: "discard unstaged edits", kind: "response" },
        ]}
      />

      <div className="pub-grid-2 pub-mt">
        <div className="pub-panel">
          <p className="pub-panel-title">Commits, branches and HEAD</p>
          <CommitGraph
            ariaLabel="Commit graph: main at C, a feature branch with D and E, origin/main one commit behind main, HEAD on feature"
            commits={[
              { id: "a", label: "A", col: 0, lane: 0 },
              { id: "b", label: "B", col: 1, lane: 0, parents: ["a"] },
              { id: "c", label: "C", col: 2, lane: 0, parents: ["b"] },
              { id: "d", label: "D", col: 2, lane: 1, parents: ["b"], tone: "violet" },
              { id: "e", label: "E", col: 3, lane: 1, parents: ["d"], tone: "violet" },
            ]}
            refs={[
              { name: "origin/main", at: "b", kind: "remote", pos: "above" },
              { name: "main", at: "c" },
              { name: "feature", at: "e" },
              { name: "HEAD", at: "e", kind: "head" },
            ]}
          />
        </div>
        <div className="pub-panel">
          <p className="pub-panel-title">Read the picture like this</p>
          <dl className="pub-kv">
            <dt>commit</dt>
            <dd>A snapshot of the whole project plus its parent, author and message. Never changes once made.</dd>
            <dt>branch</dt>
            <dd>A movable label on one commit. <code>git commit</code> moves the branch you are on.</dd>
            <dt>HEAD</dt>
            <dd>Where you are now. Usually points at a branch, which points at a commit.</dd>
            <dt>origin/main</dt>
            <dd>Your last-known position of <code>main</code> on the remote. Moves only when you fetch.</dd>
          </dl>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Merge vs rebase                                                  */
/* ------------------------------------------------------------------ */

const BASE_MAIN = [
  { id: "d", label: "D", col: 0, lane: 0 },
  { id: "e", label: "E", col: 1, lane: 0, parents: ["d"] },
  { id: "f", label: "F", col: 2, lane: 0, parents: ["e"] },
  { id: "g", label: "G", col: 3, lane: 0, parents: ["f"] },
];

export function GitMergeRebaseFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="git-merge-rebase"
      number={number}
      wide
      title="One starting point, two ways to bring feature up to date"
      caption={
        <>
          Rebasing creates new commits (<code>A′ B′ C′</code>) with the same changes and new IDs.
          The originals still exist until garbage collection and can be found with{" "}
          <code>git reflog</code>, which is why a rebase you regret is recoverable.
        </>
      }
    >
      <div className="pub-workflows">
        <div className="pub-workflow">
          <div>
            <div className="pub-stage-head"><b>0</b><span>Before</span></div>
            <p className="pub-small">Both branches moved on after feature split off at E.</p>
          </div>
          <CommitGraph
            ariaLabel="Before: main has D E F G, feature branched from E with A B C"
            commits={[
              ...BASE_MAIN,
              { id: "a", label: "A", col: 2, lane: 1, parents: ["e"], tone: "violet" },
              { id: "b", label: "B", col: 3, lane: 1, parents: ["a"], tone: "violet" },
              { id: "c", label: "C", col: 4, lane: 1, parents: ["b"], tone: "violet" },
            ]}
            refs={[{ name: "main", at: "g" }, { name: "feature", at: "c" }]}
          />
        </div>
        <div className="pub-workflow">
          <div>
            <div className="pub-stage-head"><b>a</b><span><code>git merge</code></span></div>
            <p className="pub-small">A new merge commit with two parents. Nothing existing is rewritten.</p>
          </div>
          <CommitGraph
            ariaLabel="After merging feature into main: merge commit M has parents G and C"
            commits={[
              ...BASE_MAIN,
              { id: "a", label: "A", col: 2, lane: 1, parents: ["e"], tone: "violet" },
              { id: "b", label: "B", col: 3, lane: 1, parents: ["a"], tone: "violet" },
              { id: "c", label: "C", col: 4, lane: 1, parents: ["b"], tone: "violet" },
              { id: "m", label: "M", col: 5, lane: 0, parents: ["g", "c"], tone: "gold" },
            ]}
            refs={[{ name: "main", at: "m" }]}
          />
        </div>
        <div className="pub-workflow">
          <div>
            <div className="pub-stage-head"><b>b</b><span><code>git rebase main</code></span></div>
            <p className="pub-small">Linear history. Your branch now starts at G, as if you began there.</p>
          </div>
          <CommitGraph
            ariaLabel="After rebasing feature onto main: A B C replayed after G as A prime, B prime, C prime; the originals are left behind"
            commits={[
              ...BASE_MAIN,
              { id: "a2", label: "A′", col: 4, lane: 1, parents: ["g"], tone: "violet" },
              { id: "b2", label: "B′", col: 5, lane: 1, parents: ["a2"], tone: "violet" },
              { id: "c2", label: "C′", col: 6, lane: 1, parents: ["b2"], tone: "violet" },
              { id: "a", label: "A", col: 2, lane: 2, parents: ["e"], ghost: true },
              { id: "b", label: "B", col: 3, lane: 2, parents: ["a"], ghost: true },
              { id: "c", label: "C", col: 4, lane: 2, parents: ["b"], ghost: true },
            ]}
            refs={[{ name: "main", at: "g", pos: "above" }, { name: "feature", at: "c2", pos: "above" }]}
          />
        </div>
      </div>

      <div className="pub-compare is-neutral pub-mt" role="table" aria-label="Merge and rebase compared">
        <div role="row" className="pub-compare-head"><span /><span>Merge</span><span>Rebase</span></div>
        <div role="row"><span>History</span><span>True record, including when work joined</span><span>Linear and easier to read</span></div>
        <div role="row"><span>Existing commits</span><span>Untouched</span><span>Replaced with new ones</span></div>
        <div role="row"><span>Conflicts</span><span>Resolved once</span><span>Possibly once per replayed commit</span></div>
        <div role="row"><span>Safe on shared branches</span><span>Yes</span><span>No, only on branches nobody else builds on</span></div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Pull request merge buttons                                       */
/* ------------------------------------------------------------------ */

export function GitPrMergeFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="git-pr-merge"
      number={number}
      wide
      title="What main looks like after each pull request merge option"
      caption={
        <>
          The same pull request (commits <code>A B C</code>, opened from <code>X</code> while{" "}
          <code>Y</code> landed on <code>main</code>) merged three ways. Repository settings decide
          which buttons are available. GitHub&apos;s “Rebase and merge” always writes new commit
          IDs, even when no replay was needed.
        </>
      }
    >
      <div className="pub-workflows">
        <div className="pub-workflow">
          <div>
            <div className="pub-stage-head"><b>1</b><span>Create a merge commit</span></div>
            <p className="pub-small">Keeps every commit and the shape of the work. Use when the individual commits tell a useful story.</p>
          </div>
          <CommitGraph
            ariaLabel="Merge commit: main X Y M, with M joining the branch commits A B C"
            commits={[
              { id: "x", label: "X", col: 0, lane: 0 },
              { id: "y", label: "Y", col: 2, lane: 0, parents: ["x"] },
              { id: "a", label: "A", col: 1, lane: 1, parents: ["x"], tone: "violet" },
              { id: "b", label: "B", col: 2, lane: 1, parents: ["a"], tone: "violet" },
              { id: "c", label: "C", col: 3, lane: 1, parents: ["b"], tone: "violet" },
              { id: "m", label: "M", col: 4, lane: 0, parents: ["y", "c"], tone: "gold" },
            ]}
            refs={[{ name: "main", at: "m" }]}
          />
        </div>
        <div className="pub-workflow">
          <div>
            <div className="pub-stage-head"><b>2</b><span>Squash and merge</span></div>
            <p className="pub-small">One commit per pull request. The usual choice for feature work; the PR keeps the detail.</p>
          </div>
          <CommitGraph
            ariaLabel="Squash and merge: main X Y S, where S contains the changes of A B C; the branch commits are left on the branch"
            commits={[
              { id: "x", label: "X", col: 0, lane: 0 },
              { id: "y", label: "Y", col: 1, lane: 0, parents: ["x"] },
              { id: "s", label: "S", col: 2, lane: 0, parents: ["y"], tone: "positive" },
              { id: "a", label: "A", col: 1, lane: 1, parents: ["x"], ghost: true },
              { id: "b", label: "B", col: 2, lane: 1, parents: ["a"], ghost: true },
              { id: "c", label: "C", col: 3, lane: 1, parents: ["b"], ghost: true },
            ]}
            refs={[{ name: "main", at: "s" }]}
          />
        </div>
        <div className="pub-workflow">
          <div>
            <div className="pub-stage-head"><b>3</b><span>Rebase and merge</span></div>
            <p className="pub-small">Linear, every commit kept. Suits a short series where each commit builds and passes tests.</p>
          </div>
          <CommitGraph
            ariaLabel="Rebase and merge: main X Y A prime B prime C prime in a straight line"
            commits={[
              { id: "x", label: "X", col: 0, lane: 0 },
              { id: "y", label: "Y", col: 1, lane: 0, parents: ["x"] },
              { id: "a", label: "A′", col: 2, lane: 0, parents: ["y"], tone: "violet" },
              { id: "b", label: "B′", col: 3, lane: 0, parents: ["a"], tone: "violet" },
              { id: "c", label: "C′", col: 4, lane: 0, parents: ["b"], tone: "violet" },
            ]}
            refs={[{ name: "main", at: "c" }]}
          />
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Anatomy of a conflict                                            */
/* ------------------------------------------------------------------ */

const CONFLICT_LINES: { code: string; marker?: number; tone?: string }[] = [
  { code: "def tax(amount):" },
  { code: "<<<<<<< HEAD", marker: 1 },
  { code: "    TAX_RATE = 0.20", marker: 2 },
  { code: "||||||| 3f9a2c1", marker: 3 },
  { code: "    TAX_RATE = 0.18" },
  { code: "=======", marker: 4 },
  { code: "    TAX_RATE = 0.1925", marker: 5 },
  { code: ">>>>>>> main", marker: 6 },
  { code: "    return round(amount * TAX_RATE, 2)" },
];

const CONFLICT_NOTES: { n: number; title: string; body: string }[] = [
  { n: 1, title: "<<<<<<< HEAD", body: "Start of the version on the branch you have checked out." },
  { n: 2, title: "your side", body: "You changed the rate from 0.18 to 0.20." },
  { n: 3, title: "||||||| 3f9a2c1", body: "The common ancestor, labelled with its commit. Shown only with merge.conflictStyle set to diff3 or zdiff3, and it is what makes the right answer visible." },
  { n: 4, title: "=======", body: "Separates the two sides." },
  { n: 5, title: "their side", body: "The branch being merged in changed the same line to 0.1925." },
  { n: 6, title: ">>>>>>> main", body: "End of the conflict, labelled with the other branch." },
];

export function GitConflictFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="git-conflict"
      number={number}
      wide
      title="Reading a conflict, with the common ancestor shown"
      caption={
        <>
          Delete all four marker lines, write what the code should be (one side, the other, or a
          combination), then run the tests before <code>git add</code>. During a rebase the labels
          swap: <code>HEAD</code> is the branch you are rebasing onto, and your own commit is the
          incoming side.
        </>
      }
    >
      <div className="pub-annotated">
        <pre className="pub-annotated-code" aria-label="A merge conflict in billing.py with the zdiff3 conflict style">
          {CONFLICT_LINES.map((line, i) => (
            <span key={i} className="pub-annotated-line">
              <span className="pub-annotated-marker">{line.marker ?? ""}</span>
              <span>{line.code}</span>
            </span>
          ))}
        </pre>
        <ol className="pub-annotated-notes">
          {CONFLICT_NOTES.map((note) => (
            <li key={note.n}>
              <span className="pub-annotated-marker">{note.n}</span>
              <div>
                <p><code>{note.title}</code></p>
                <p>{note.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Undo map                                                         */
/* ------------------------------------------------------------------ */

const UNDO_GROUPS: { title: string; note: string; tone: "positive" | "gold" | "danger"; tag: string; rows: [string, string][] }[] = [
  {
    title: "Not committed yet",
    note: "Only your working tree and index are involved.",
    tone: "positive",
    tag: "no history touched",
    rows: [
      ["Discard edits to a file", "git restore <file>"],
      ["Unstage, keep the edits", "git restore --staged <file>"],
      ["Park everything for later", "git stash push -m \"…\""],
      ["Delete untracked files", "git clean -nd, then -fd"],
    ],
  },
  {
    title: "Committed, not pushed",
    note: "Rewriting is fine: nobody else has these commits.",
    tone: "gold",
    tag: "rewrites your history",
    rows: [
      ["Fix the last message or add a file", "git commit --amend"],
      ["Undo last commit, keep it staged", "git reset --soft HEAD~1"],
      ["Undo last commit, keep the edits", "git reset HEAD~1"],
      ["Undo last commit and its edits", "git reset --hard HEAD~1"],
      ["Tidy several commits", "git rebase -i origin/main"],
    ],
  },
  {
    title: "Pushed and shared",
    note: "Add new commits instead of rewriting old ones.",
    tone: "danger",
    tag: "never rewrite",
    rows: [
      ["Undo a commit everywhere", "git revert <sha>"],
      ["Undo a merge commit", "git revert -m 1 <sha>"],
      ["Your own branch, after a rebase", "git push --force-with-lease"],
    ],
  },
];

export function GitUndoFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="git-undo"
      number={number}
      wide
      title="Undoing things: first ask where the change is"
      caption={
        <>
          <code>git reset --hard</code> and <code>git clean -fd</code> delete uncommitted work for
          good; everything else here can be undone. For committed work that seems lost,{" "}
          <code>git reflog</code> lists every position <code>HEAD</code> has had, and{" "}
          <code>git switch -c rescue &lt;sha&gt;</code> brings one back.
        </>
      }
    >
      <div className="pub-stages">
        {UNDO_GROUPS.map((group) => (
          <div key={group.title} className="pub-stage">
            <div className="pub-stage-head"><span>{group.title}</span></div>
            <Tag tone={group.tone}>{group.tag}</Tag>
            <p className="pub-small pub-mt">{group.note}</p>
            <dl className="pub-undo">
              {group.rows.map(([situation, command]) => (
                <div key={command}>
                  <dt>{situation}</dt>
                  <dd><code>{command}</code></dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Team workflows                                                   */
/* ------------------------------------------------------------------ */

export function GitWorkflowsFigure({ number }: FigureProps) {
  return (
    <FigureFrame
      id="git-workflows"
      number={number}
      wide
      title="Three team workflows, drawn as history"
      caption={
        <>
          The shape of the history follows from how a team integrates. The longer a branch lives
          away from <code>main</code>, the more it drifts and the larger the eventual merge.
        </>
      }
    >
      <div className="pub-workflows">
        <div className="pub-workflow">
          <div>
            <p className="pub-panel-title">GitHub flow</p>
            <p className="pub-small"><code>main</code> is always deployable. Short branches, a pull request each, deploy after merge.</p>
            <p className="pub-small"><strong>Fits:</strong> most web products and small teams.</p>
          </div>
          <CommitGraph
            ariaLabel="GitHub flow: short feature branches each merged back into main"
            laneLabels={["main", "feature/*"]}
            commits={[
              { id: "m0", col: 0, lane: 0 },
              { id: "f1", col: 1, lane: 1, parents: ["m0"], tone: "violet" },
              { id: "f2", col: 2, lane: 1, parents: ["f1"], tone: "violet" },
              { id: "m1", col: 3, lane: 0, parents: ["m0", "f2"], tone: "gold" },
              { id: "g1", col: 4, lane: 1, parents: ["m1"], tone: "violet" },
              { id: "m2", col: 5, lane: 0, parents: ["m1", "g1"], tone: "gold" },
              { id: "h1", col: 6, lane: 1, parents: ["m2"], tone: "violet" },
              { id: "h2", col: 7, lane: 1, parents: ["h1"], tone: "violet" },
              { id: "m3", col: 8, lane: 0, parents: ["m2", "h2"], tone: "gold" },
            ]}
          />
        </div>
        <div className="pub-workflow">
          <div>
            <p className="pub-panel-title">Trunk-based development</p>
            <p className="pub-small">Everyone integrates into <code>main</code> at least daily. Unfinished work hides behind feature flags.</p>
            <p className="pub-small"><strong>Fits:</strong> teams with fast, trusted CI and frequent deploys.</p>
          </div>
          <CommitGraph
            ariaLabel="Trunk-based development: small commits straight onto main, with branches that live less than a day"
            laneLabels={["main", "short-lived"]}
            commits={[
              { id: "t0", col: 0, lane: 0 },
              { id: "t1", col: 1, lane: 0, parents: ["t0"] },
              { id: "b1", col: 2, lane: 1, parents: ["t1"], tone: "violet" },
              { id: "t2", col: 2, lane: 0, parents: ["t1"] },
              { id: "t3", col: 3, lane: 0, parents: ["t2", "b1"], tone: "gold" },
              { id: "t4", col: 4, lane: 0, parents: ["t3"] },
              { id: "t5", col: 5, lane: 0, parents: ["t4"] },
              { id: "b2", col: 6, lane: 1, parents: ["t5"], tone: "violet" },
              { id: "t6", col: 7, lane: 0, parents: ["t5", "b2"], tone: "gold" },
              { id: "t7", col: 8, lane: 0, parents: ["t6"] },
            ]}
          />
        </div>
        <div className="pub-workflow">
          <div>
            <p className="pub-panel-title">Git flow</p>
            <p className="pub-small">A <code>develop</code> branch collects work; <code>release/*</code> branches stabilise it; <code>main</code> holds tagged releases.</p>
            <p className="pub-small"><strong>Fits:</strong> versioned software with scheduled releases, such as apps that go through store review.</p>
          </div>
          <CommitGraph
            ariaLabel="Git flow: feature merges into develop, a release branch is cut from develop, merged into main with a tag and back into develop"
            laneLabels={["main", "release/*", "develop", "feature/*"]}
            commits={[
              { id: "m0", label: "", col: 0, lane: 0 },
              { id: "d0", col: 1, lane: 2, parents: ["m0"] },
              { id: "f1", col: 2, lane: 3, parents: ["d0"], tone: "violet" },
              { id: "f2", col: 3, lane: 3, parents: ["f1"], tone: "violet" },
              { id: "d1", col: 4, lane: 2, parents: ["d0", "f2"], tone: "gold" },
              { id: "r0", col: 5, lane: 1, parents: ["d1"], tone: "positive" },
              { id: "r1", col: 6, lane: 1, parents: ["r0"], tone: "positive" },
              { id: "m1", col: 7, lane: 0, parents: ["m0", "r1"], tone: "gold" },
              { id: "d2", col: 8, lane: 2, parents: ["d1", "r1"], tone: "gold" },
            ]}
            refs={[
              { name: "v1.0", at: "m0", kind: "tag", pos: "above" },
              { name: "v1.1", at: "m1", kind: "tag", pos: "above" },
            ]}
          />
        </div>
      </div>
    </FigureFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Quick reference                                                  */
/* ------------------------------------------------------------------ */

export function GitQuickReferenceFigure({ number }: FigureProps) {
  return (
    <FigureFrame id="git-quick-reference" number={number} wide title="Git & GitHub quick reference">
      <div className="pub-qr">
        <section>
          <h4>Start</h4>
          <table>
            <tbody>
              <tr><td><code>git clone &lt;url&gt;</code></td><td>copy a repository</td></tr>
              <tr><td><code>git switch -c &lt;b&gt;</code></td><td>new branch, move to it</td></tr>
              <tr><td><code>git switch &lt;b&gt;</code></td><td>move to a branch</td></tr>
              <tr><td><code>git switch -</code></td><td>back to the previous one</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Save</h4>
          <table>
            <tbody>
              <tr><td><code>git status</code></td><td>what changed</td></tr>
              <tr><td><code>git add -p</code></td><td>stage hunk by hunk</td></tr>
              <tr><td><code>git diff --staged</code></td><td>what you will commit</td></tr>
              <tr><td><code>git commit</code></td><td>record the snapshot</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Sync</h4>
          <table>
            <tbody>
              <tr><td><code>git fetch --prune</code></td><td>update remote refs</td></tr>
              <tr><td><code>git pull</code></td><td>fetch, then merge or rebase</td></tr>
              <tr><td><code>git push</code></td><td>share your commits</td></tr>
              <tr><td><code>--force-with-lease</code></td><td>after rebasing your branch</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Integrate</h4>
          <table>
            <tbody>
              <tr><td><code>git rebase origin/main</code></td><td>update your branch</td></tr>
              <tr><td><code>git rebase -i</code></td><td>squash, reword, reorder</td></tr>
              <tr><td><code>git merge &lt;b&gt;</code></td><td>join histories</td></tr>
              <tr><td><code>git cherry-pick &lt;sha&gt;</code></td><td>copy one commit</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Inspect</h4>
          <table>
            <tbody>
              <tr><td><code>git log --oneline --graph</code></td><td>history at a glance</td></tr>
              <tr><td><code>git log -p &lt;file&gt;</code></td><td>every change to a file</td></tr>
              <tr><td><code>git log -S &quot;text&quot;</code></td><td>when text appeared</td></tr>
              <tr><td><code>git blame &lt;file&gt;</code></td><td>last change per line</td></tr>
              <tr><td><code>git bisect</code></td><td>find the breaking commit</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Undo</h4>
          <table>
            <tbody>
              <tr><td><code>git restore &lt;file&gt;</code></td><td>discard edits</td></tr>
              <tr><td><code>git restore --staged</code></td><td>unstage</td></tr>
              <tr><td><code>git commit --amend</code></td><td>fix last commit (unpushed)</td></tr>
              <tr><td><code>git reset --soft HEAD~1</code></td><td>uncommit, keep staged</td></tr>
              <tr><td><code>git revert &lt;sha&gt;</code></td><td>undo a pushed commit</td></tr>
              <tr><td><code>git reflog</code></td><td>find “lost” commits</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h4>Conflicts</h4>
          <ul>
            <li><code>git status</code> lists conflicted files</li>
            <li>Edit, delete markers, run tests</li>
            <li><code>git add</code> then <code>--continue</code></li>
            <li><code>git merge --abort</code> / <code>git rebase --abort</code></li>
            <li>In a rebase, “ours” is the upstream</li>
          </ul>
        </section>
        <section>
          <h4>Worth setting once</h4>
          <pre>{`git config --global \\
  merge.conflictStyle zdiff3
git config --global \\
  push.autoSetupRemote true
git config --global \\
  rerere.enabled true`}</pre>
        </section>
        <section>
          <h4>Before you open a PR</h4>
          <ul className="pub-ticks">
            <li>One purpose, small diff</li>
            <li>Rebased on current <code>main</code></li>
            <li>Read your own diff first</li>
            <li>Says what, why, how tested</li>
            <li>CI green</li>
            <li>No secrets, no stray debug code</li>
          </ul>
        </section>
      </div>
    </FigureFrame>
  );
}
