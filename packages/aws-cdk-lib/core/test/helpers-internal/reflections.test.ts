import { Lazy } from '../../lib';
import { resolvedGet } from '../../lib/helpers-internal/reflections';

describe('resolvedGet', () => {
  test('returns value at simple path', () => {
    expect(resolvedGet({ a: { b: 'hello' } }, 'a.b', 'fallback')).toBe('hello');
  });

  test('returns value at numeric index path', () => {
    expect(resolvedGet({ items: ['zero', 'one', 'two'] }, 'items.1', 'fallback')).toBe('one');
  });

  test('returns deeply nested value', () => {
    const obj = { a: { b: [{ c: 42 }] } };
    expect(resolvedGet(obj, 'a.b.0.c', -1)).toBe(42);
  });

  test('returns undefined for missing intermediate segment', () => {
    expect(resolvedGet({ a: {} }, 'a.b.c', 'fallback')).toBeUndefined();
  });

  test('returns undefined for null intermediate segment', () => {
    expect(resolvedGet({ a: { b: null } }, 'a.b.c', 'fallback')).toBeUndefined();
  });

  test('returns undefined for missing root property', () => {
    expect(resolvedGet({}, 'missing.deep', 'fallback')).toBeUndefined();
  });

  test('returns fallback when root is a resolvable', () => {
    const token = Lazy.any({ produce: () => ({ nested: 'value' }) });
    expect(resolvedGet(token, 'nested', 'fallback')).toBe('fallback');
  });

  test('returns fallback when intermediate value is a resolvable', () => {
    const obj = { a: Lazy.any({ produce: () => ({ b: 'value' }) }) };
    expect(resolvedGet(obj, 'a.b', 'fallback')).toBe('fallback');
  });

  test('returns fallback when leaf value is a resolvable', () => {
    const obj = { a: { b: Lazy.any({ produce: () => 'value' }) } };
    expect(resolvedGet(obj, 'a.b', 'fallback')).toBe('fallback');
  });

  test('returns false for boolean fallback on resolvable', () => {
    const obj = { config: Lazy.any({ produce: () => ({ enabled: true }) }) };
    expect(resolvedGet(obj, 'config.enabled', false)).toBe(false);
  });

  test('returns actual boolean value when not a resolvable', () => {
    expect(resolvedGet({ config: { enabled: true } }, 'config.enabled', false)).toBe(true);
  });

  test('returns undefined fallback on resolvable', () => {
    const obj = { config: Lazy.any({ produce: () => 'kms' }) };
    expect(resolvedGet(obj, 'config', undefined)).toBeUndefined();
  });
});
