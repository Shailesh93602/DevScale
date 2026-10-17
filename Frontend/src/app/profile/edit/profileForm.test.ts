import { describe, it, expect } from 'vitest';
import { formValuesToPayload, type ProfileFormValues } from './profileForm';

describe('formValuesToPayload', () => {
  it('never sends an id in the profile PUT body', () => {
    const values = {
      first_name: 'Grace',
      last_name: 'Hopper',
      username: 'grace_h',
      email: 'someone-else@example.com',
      id: 'another-user',
    } as unknown as ProfileFormValues;
    const body = formValuesToPayload(values) as Record<string, unknown>;
    expect(body).not.toHaveProperty('id');
    expect(body.username).toBe('grace_h');
  });
});
