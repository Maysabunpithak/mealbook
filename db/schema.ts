import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core'

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  mealId: text('mealId').notNull(),
  parentId: text('parentId'),
  author: text('author').notNull(),
  body: text('body').notNull(),
  createdAt: text('createdAt').notNull(),
}, (table) => [index('comments_meal_created').on(table.mealId, table.createdAt)])
