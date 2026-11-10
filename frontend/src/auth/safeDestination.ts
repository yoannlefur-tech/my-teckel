// A backslash counts too: browsers read "/\evil.com" as "//evil.com".
export function safeDestination(destination: unknown) {
  return typeof destination === 'string' && /^\/(?![/\\])/.test(destination)
    ? destination
    : '/'
}
