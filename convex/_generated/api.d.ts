/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as clients from "../clients.js";
import type * as editing from "../editing.js";
import type * as helpers from "../helpers.js";
import type * as migrations from "../migrations.js";
import type * as notes from "../notes.js";
import type * as payments from "../payments.js";
import type * as projects from "../projects.js";
import type * as publishing from "../publishing.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  calendar: typeof calendar;
  clients: typeof clients;
  editing: typeof editing;
  helpers: typeof helpers;
  migrations: typeof migrations;
  notes: typeof notes;
  payments: typeof payments;
  projects: typeof projects;
  publishing: typeof publishing;
  settings: typeof settings;
  storage: typeof storage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
