import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('/', () => {
  it('responds with Hello World!', async () => {
    const response = await SELF.fetch('https://example.com');
    expect(await response.json()).toMatchObject({ message: 'Hello World!' });
  });
});
