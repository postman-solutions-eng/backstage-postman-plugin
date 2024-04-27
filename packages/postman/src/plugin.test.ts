import { postmanPlugin } from './plugin';

describe('postman', () => {
  it('should export plugin', () => {
    expect(postmanPlugin).toBeDefined();
  });
});
