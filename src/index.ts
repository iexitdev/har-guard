export interface Har {
  log: HarLog;
}

export interface HarLog {
  version: string;
  creator: HarNameVersion;
  browser?: HarNameVersion;
  pages?: HarPage[];
  entries: HarEntry[];
  comment?: string;
}

export interface HarNameVersion {
  name: string;
  version: string;
  comment?: string;
}

export interface HarPage {
  startedDateTime: string;
  id: string;
  title: string;
  pageTimings: Record<string, unknown>;
  comment?: string;
}

export interface HarEntry {
  pageref?: string;
  startedDateTime: string;
  time: number;
  request: HarRequest;
  response: HarResponse;
  cache?: Record<string, unknown>;
  timings: HarTimings;
  serverIPAddress?: string;
  connection?: string;
  comment?: string;
}

export interface HarRequest {
  method: string;
  url: string;
  httpVersion: string;
  cookies: HarNameValue[];
  headers: HarNameValue[];
  queryString: HarNameValue[];
  postData?: Record<string, unknown>;
  headersSize: number;
  bodySize: number;
  comment?: string;
}

export interface HarResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  cookies: HarNameValue[];
  headers: HarNameValue[];
  content: HarContent;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
  comment?: string;
}

export interface HarContent {
  size: number;
  compression?: number;
  mimeType: string;
  text?: string;
  encoding?: string;
  comment?: string;
}

export interface HarTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
  comment?: string;
}

export interface HarNameValue {
  name: string;
  value: string;
  comment?: string;
}

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  issues: ValidationIssue[];
  value: T | undefined;
}

export class HarValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(`HAR validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}`);
    this.name = "HarValidationError";
    this.issues = issues;
  }
}

type Validator = (value: unknown, path: string, issues: ValidationIssue[]) => void;

export function validateHar(value: unknown): ValidationResult<Har> {
  return validate(value, validateHarRoot);
}

export function validateEntry(value: unknown): ValidationResult<HarEntry> {
  return validate(value, validateHarEntry);
}

export function validateRequest(value: unknown): ValidationResult<HarRequest> {
  return validate(value, validateHarRequest);
}

export function validateResponse(value: unknown): ValidationResult<HarResponse> {
  return validate(value, validateHarResponse);
}

export function assertHar(value: unknown): asserts value is Har {
  const result = validateHar(value);

  if (!result.valid) {
    throw new HarValidationError(result.issues);
  }
}

export function isHar(value: unknown): value is Har {
  return validateHar(value).valid;
}

export function har(value: unknown): Promise<Har> {
  return promiseValidated(validateHar(value));
}

export function entry(value: unknown): Promise<HarEntry> {
  return promiseValidated(validateEntry(value));
}

export function request(value: unknown): Promise<HarRequest> {
  return promiseValidated(validateRequest(value));
}

export function response(value: unknown): Promise<HarResponse> {
  return promiseValidated(validateResponse(value));
}

function validate<T>(value: unknown, validator: Validator): ValidationResult<T> {
  const issues: ValidationIssue[] = [];
  validator(value, "$", issues);

  return {
    valid: issues.length === 0,
    issues,
    value: issues.length === 0 ? (value as T) : undefined
  };
}

function promiseValidated<T>(result: ValidationResult<T>): Promise<T> {
  if (result.valid) {
    return Promise.resolve(result.value as T);
  }

  return Promise.reject(new HarValidationError(result.issues));
}

function validateHarRoot(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  validateHarLog(value.log, `${path}.log`, issues);
}

function validateHarLog(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireString(value.version, `${path}.version`, issues);
  validateNameVersion(value.creator, `${path}.creator`, issues);
  requireArray(value.entries, `${path}.entries`, issues, validateHarEntry);

  if (value.pages !== undefined) {
    requireArray(value.pages, `${path}.pages`, issues, validatePage);
  }
}

function validateHarEntry(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireDateString(value.startedDateTime, `${path}.startedDateTime`, issues);
  requireNonNegativeNumber(value.time, `${path}.time`, issues);
  validateHarRequest(value.request, `${path}.request`, issues);
  validateHarResponse(value.response, `${path}.response`, issues);
  validateTimings(value.timings, `${path}.timings`, issues);
}

function validateHarRequest(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireString(value.method, `${path}.method`, issues);
  requireUrl(value.url, `${path}.url`, issues);
  requireString(value.httpVersion, `${path}.httpVersion`, issues);
  requireArray(value.cookies, `${path}.cookies`, issues, validateNameValue);
  requireArray(value.headers, `${path}.headers`, issues, validateNameValue);
  requireArray(value.queryString, `${path}.queryString`, issues, validateNameValue);
  requireNumber(value.headersSize, `${path}.headersSize`, issues);
  requireNumber(value.bodySize, `${path}.bodySize`, issues);
}

function validateHarResponse(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireIntegerRange(value.status, `${path}.status`, issues, 0, 999);
  requireString(value.statusText, `${path}.statusText`, issues);
  requireString(value.httpVersion, `${path}.httpVersion`, issues);
  requireArray(value.cookies, `${path}.cookies`, issues, validateNameValue);
  requireArray(value.headers, `${path}.headers`, issues, validateNameValue);
  validateContent(value.content, `${path}.content`, issues);
  requireString(value.redirectURL, `${path}.redirectURL`, issues);
  requireNumber(value.headersSize, `${path}.headersSize`, issues);
  requireNumber(value.bodySize, `${path}.bodySize`, issues);
}

function validateContent(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireNumber(value.size, `${path}.size`, issues);
  requireString(value.mimeType, `${path}.mimeType`, issues);

  if (value.compression !== undefined) {
    requireNumber(value.compression, `${path}.compression`, issues);
  }
}

function validateTimings(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  for (const key of ["send", "wait", "receive"] as const) {
    requireTiming(value[key], `${path}.${key}`, issues);
  }

  for (const key of ["blocked", "dns", "connect", "ssl"] as const) {
    if (value[key] !== undefined) {
      requireTiming(value[key], `${path}.${key}`, issues);
    }
  }
}

function validateNameVersion(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireString(value.name, `${path}.name`, issues);
  requireString(value.version, `${path}.version`, issues);
}

function validateNameValue(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireString(value.name, `${path}.name`, issues);
  requireString(value.value, `${path}.value`, issues);
}

function validatePage(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(value, path, issues)) {
    return;
  }

  requireDateString(value.startedDateTime, `${path}.startedDateTime`, issues);
  requireString(value.id, `${path}.id`, issues);
  requireString(value.title, `${path}.title`, issues);

  if (!isRecord(value.pageTimings, `${path}.pageTimings`, issues)) {
    return;
  }
}

function requireArray(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  validator: Validator
): void {
  if (!Array.isArray(value)) {
    addIssue(issues, path, "type", "Expected an array");
    return;
  }

  value.forEach((item, index) => validator(item, `${path}[${index}]`, issues));
}

function requireString(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "string") {
    addIssue(issues, path, "type", "Expected a string");
  }
}

function requireNumber(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addIssue(issues, path, "type", "Expected a finite number");
  }
}

function requireNonNegativeNumber(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    addIssue(issues, path, "range", "Expected a non-negative finite number");
  }
}

function requireTiming(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < -1) {
    addIssue(issues, path, "range", "Expected a finite timing value greater than or equal to -1");
  }
}

function requireIntegerRange(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  min: number,
  max: number
): void {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    addIssue(issues, path, "range", `Expected an integer from ${min} to ${max}`);
  }
}

function requireDateString(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    addIssue(issues, path, "format", "Expected an ISO-compatible date string");
  }
}

function requireUrl(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "string") {
    addIssue(issues, path, "type", "Expected a URL string");
    return;
  }

  try {
    new URL(value);
  } catch {
    addIssue(issues, path, "format", "Expected an absolute URL");
  }
}

function isRecord(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    addIssue(issues, path, "type", "Expected an object");
    return false;
  }

  return true;
}

function addIssue(
  issues: ValidationIssue[],
  path: string,
  code: string,
  message: string
): void {
  issues.push({ path, code, message });
}
