# Badbury
Badbury is a TypeScript library collection that enables and promotes DDD principles while minimising complexity.

This project is inspired by family of domain focused philosophies:

- Domain Driven Design by Eric Evans in 2003
- Hexagonal Architecture by Alistair Cockburn in 2005
- Onion Architecture by Jeffrey Palermo in 2008
- Clean Architecture by Robert C. Martin in 2012

Badbury tries to distil the main lessons from these philosophies while making it simple and accessible to everyone.

We do this by providing three things...

### Badbury IoC

[https://github.com/badbury/ioc](https://github.com/badbury/ioc)

The Badbury Inversion of Control Framework provides:
- Dependency Injection
- Event Routing
- Component Composition

...all while staying out of your way! Very little of your codebase will
depend on this framework and it won't dictate the project structure.

### Badbury Components

[https://github.com/badbury](https://github.com/badbury)

The Badbury Components are a collection of TypeScript libraries with the following design goals:
- Encorrage "details" to depend on "domain" and not the other way around
- Following SOLID principles
- As type safe as possible
- Start simple and scale into a mantainable codebase

### Badbury Project

[https://github.com/badbury/project](https://github.com/badbury/project)

An opinionated project starter with Badbury components and a folder structure.

## Core principles

Components are split into Domain, Application, Infrastructure just like in clean architecture

### Domain

**Summary**: Business logic is about defining what happens but not how it happens

**Rules**: Your business logic should only depend on other business logic WHY?

### Application

**Summary**: Application logic is about how something happens.

**Rules**: Technical details like Http/DB/Caches should be decoupled from the business logic using adapters. WHY?

### Infrastructure

**Summary**: Infrastructure logic is about the outside world

## Problems with other philosophies, libraries and frameworks
A lot of DDD libraries provide abstractions for the Domain like Entity, UUID and Aggregate Root. This does 2 things:

1. Leads you to create abstractions that you may not need
2. Couples your domain, application and infrastructure to a

## DDD can be over-engineered
To master DDD you need to learn about:
- Domain Models
- Domain Events
- Data Transfer Object
- UUID
- Value Objects
- Bounded Contexts
- Ubiquitous Language
- Aggregate Roots
- CQRSs
- Event Store
- Command Bus
- Event Bus
- Query Bus
- Repositories
- Use Cases

Badbury just encorrages you to focus on the Business/Details split,
then you can pick and choose which patterns and abstractions to use as you go.

## Recommended packages to use with Badbury

- NestJS Components - https://github.com/nestjs
- TypeStack Components - https://github.com/typestack
- TypeORM - https://github.com/typeorm/typeorm
- Pino
- RxJS
- Zod

# Development

## TODO
- Consider how http and cli can work without ioc
- Consider how libraries can build optional badbury ioc integrations
- Create a blessed/approved libraries list, especially for areas not covered by badbury

## Vision

ioc────────┐
├───config─┤
├───timers─┤
├───http───┤
└───cli────┤
           └─platform
