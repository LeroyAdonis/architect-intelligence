import { relations } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
    role: text("role").notNull().default("worker"),
    dailyKmTarget: integer("dailyKmTarget").notNull().default(50), 
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt")
});

export const site = pgTable("site", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const visit = pgTable("visit", {
    id: text("id").primaryKey(),
    workerId: text("workerId").notNull().references(() => user.id),
    siteId: text("siteId").notNull().references(() => site.id),
    visitDate: timestamp("visitDate", { mode: 'date' }).notNull(),
    kmCovered: integer("kmCovered").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const inspection = pgTable("inspection", {
    id: text("id").primaryKey(),
    visitId: text("visitId").notNull().references(() => visit.id, { onDelete: 'cascade' }),
    itemName: text("itemName").notNull(), 
    notes: text("notes"),
    status: text("status").notNull().default('ok'), 
    inspectedAt: timestamp("inspectedAt").defaultNow().notNull(),
});

export const visitRelations = relations(visit, ({ one, many }) => ({
	site: one(site, {
		fields: [visit.siteId],
		references: [site.id],
	}),
    worker: one(user, {
        fields: [visit.workerId],
        references: [user.id],
    }),
    inspections: many(inspection),
}));

export const siteRelations = relations(site, ({ many }) => ({
    visits: many(visit),
}));

export const userRelations = relations(user, ({ many }) => ({
    visits: many(visit),
}));

export const inspectionRelations = relations(inspection, ({ one }) => ({
    visit: one(visit, {
        fields: [inspection.visitId],
        references: [visit.id]
    })
}));
