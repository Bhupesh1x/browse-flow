import { bigint, boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: bigint('id', { mode: 'number' })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  author: text('author').notNull().default('anonymous'),
  content: text('content').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});