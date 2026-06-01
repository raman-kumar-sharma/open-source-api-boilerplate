import { z } from 'zod';
import { ROLES } from '../utils/constants.js';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID');

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      role: z.enum([ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

const getUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const deleteUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const listUsersSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      search: z.string().optional(),
      searchFields: z.string().optional(),
      role: z.enum([ROLES.USER, ROLES.MANAGER, ROLES.ADMIN]).optional(),
      isActive: z.enum(['true', 'false']).optional(),
    })
    .optional(),
});

export {
  updateProfileSchema,
  updateUserSchema,
  getUserSchema,
  deleteUserSchema,
  listUsersSchema,
};
