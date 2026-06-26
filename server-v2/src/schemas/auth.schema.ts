import { Type } from '@sinclair/typebox';

export const LoginBodySchema = Type.Object({
  username: Type.String({ minLength: 3 }),
  password: Type.String({ minLength: 6 }),
});

export const ChangePasswordBodySchema = Type.Object({
  oldPassword: Type.String({ minLength: 6 }),
  newPassword: Type.String({ minLength: 8 }),
});