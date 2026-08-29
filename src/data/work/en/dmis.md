---
title: Dealer Management Information System
tagline: A dealership platform built on a PHP framework written from scratch
format: case-study
order: 2
year: '2026'
role: Backend team lead
context: coursework
stack:
  - PHP 8
  - MySQL
  - PDO
  - Cloudinary
  - DomPDF
  - Vercel
repo: https://github.com/valtzyy/RBPL-Project-SI-E
live: https://rbpl-project-si-e.vercel.app/login
liveStatus: down
liveNote: Deployed, but the database is held by the project owner and is currently down
facts:
  - value: '37'
    label: migrations
  - value: '30'
    label: controllers
  - value: '40+'
    label: models
backdrop: ../../../assets/work/shot-dealership.jpg
backdropAlt: A vehicle seen from above on a forecourt
---

## The problem

A vehicle dealership is not one system. Procurement, inventory, sales, credit
applications, cashier payments, workshop services, spare parts, delivery
scheduling and reporting all touch the same vehicles and the same customers,
and each department sees a different slice. Modelled badly, every module ends up
reaching into every other one.

## My role

I led backend development for a multidisciplinary team. I owned the database
schema, the backend architecture and the API surface, designed the
authentication and authorisation system, ran the migrations, and coordinated
integration across the people building on top of it.

## The framework underneath

The constraint was PHP without Composer, so the foundation had to be written
first. That turned into a small MVC framework: a router with URL parameters, an
authentication layer, a model abstraction over PDO, a database connection
configured from `.env`, and a CLI migration runner.

Building the framework before the product was the right order here, but it is
worth being clear about why: the alternative was thirty controllers each opening
their own connection and parsing their own routes. The framework exists to make
the schema the only thing anyone has to think about.

## Schema and access control

Thirty-seven migrations describe the domain — users and roles, customers,
vehicles, spare parts, transactions, payments, invoices, credit applications and
decisions, service bookings and billing, procurement, delivery schedules.

Role-based access control runs across several user types, and it is enforced in
the authorisation layer rather than in each controller. A cashier, a sales
officer, a workshop technician and an administrator see genuinely different
systems built from the same tables.

## Where it stands

The application is still deployed, but the managed MySQL instance behind it is
held by the project's owner rather than by me, and it is currently down — the
live URL returns a database connection error. The schema, migrations and seeders
are all in the repository, and the system runs locally against any MySQL 8
instance.
