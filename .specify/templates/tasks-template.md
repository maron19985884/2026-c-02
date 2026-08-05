---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize project with dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Setup API routing and middleware structure
- [ ] T006 Create base models/entities that all stories depend on
- [ ] T007 Configure error handling and logging infrastructure
- [ ] T008 Setup environment configuration management

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description]

**Independent Test**: [How to verify this story works on its own]

- [ ] T009 [P] [US1] Create [Entity1] model in backend/src/models/[entity1].ts
- [ ] T010 [P] [US1] Create [Entity2] model in backend/src/models/[entity2].ts
- [ ] T011 [US1] Implement [Service] in backend/src/services/[service].ts
- [ ] T012 [US1] Implement [endpoint] in backend/src/api/[file].ts
- [ ] T013 [US1] Implement [Component] in frontend/src/components/[Component].tsx

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] TXXX [P] Documentation updates
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story should be independently completable and testable
- Commit after each task or logical group
