---
title: Archenym
tagline: Tracing fake job posts back to the original scam, to catch human trafficking early
format: case-study
order: 1
year: '2026'
role: Full-stack developer
context: personal
stack:
  - Next.js 14
  - FastAPI
  - PostgreSQL
  - TF-IDF
  - PageRank
  - vis-network
repo: https://github.com/valtzyy/Archenym
facts:
  - value: '93'
    label: source files
  - value: '3'
    label: analysis layers
backdrop: ../../../assets/work/shot-network.jpg
backdropAlt: City lights seen from orbit, standing in for a network of linked accounts
---

## The problem

Fake job advertisements are one of the entry points for human trafficking in
Indonesia. They spread across social media as near-copies of each other — the
same promises, lightly reworded, posted from different accounts. Reading them
one at a time tells you almost nothing. The signal is in how they relate.

## What it does

Archenym is a forensic intelligence board that treats a corpus of job posts as
a network rather than a list. It answers a question a human investigator cannot
answer by hand: which post came first, and which are derivatives of it?

Three layers do the work.

**Preprocessing** normalises the text and extracts entities — phone numbers,
bank account numbers, names. These become the hard links between posts that
share no wording but share a payout account.

**Lineage** measures similarity three ways at once: TF-IDF over the text, fuzzy
ratio for near-duplicate phrasing, and entity overlap for the hard links. The
three combine into an edge weight between every pair of posts, and clustering
turns that weighted graph into candidate networks.

**Arché scoring** finds the origin. It runs PageRank across the similarity graph
and breaks ties chronologically, so the post that most others descend from —
the *arché* — surfaces to the top of its cluster.

## Decisions worth naming

**The web checker runs entirely client-side.** Someone pasting a suspicious job
ad may be a victim in progress. Sending that text to a server creates a record
of their situation that did not need to exist, so the instant risk check never
leaves the browser. Only bulk corpus analysis touches the backend.

**Similarity is three signals, not one.** TF-IDF alone misses reworded posts.
Fuzzy matching alone misses posts that share only a bank account. Neither is
sufficient, and the failure modes are different, so the pipeline scores all
three and combines them.

**PageRank needed a tie-break.** In a cluster of near-identical posts, several
nodes score almost identically. Chronology is the only ordering that means
anything for provenance, so it resolves the ties.

## Where it stands

This is an MVP with unit tests over the pipeline and the database layer, and a
synthetic sample corpus for demonstration. The scoring has not been validated
against a labelled real-world dataset — that is the honest limit of the current
work, and the next thing it needs.
