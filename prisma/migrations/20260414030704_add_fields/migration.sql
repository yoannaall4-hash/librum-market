-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;
ALTER TABLE "User" ADD COLUMN "bankAccount" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeAccountId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isbn" TEXT,
    "language" TEXT NOT NULL DEFAULT 'bg',
    "condition" TEXT NOT NULL DEFAULT 'new',
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "images" TEXT NOT NULL DEFAULT '[]',
    "period" TEXT,
    "liturgicalUse" TEXT,
    "year" INTEGER,
    "pages" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending_approval',
    "views" INTEGER NOT NULL DEFAULT 0,
    "sellerId" TEXT NOT NULL,
    "publisherId" TEXT,
    "categoryId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" DATETIME,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Book_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("categoryId", "condition", "createdAt", "description", "featuredUntil", "id", "images", "isFeatured", "isbn", "language", "liturgicalUse", "originalPrice", "pages", "period", "price", "publisherId", "sellerId", "status", "stock", "title", "updatedAt", "views", "year") SELECT "categoryId", "condition", "createdAt", "description", "featuredUntil", "id", "images", "isFeatured", "isbn", "language", "liturgicalUse", "originalPrice", "pages", "period", "price", "publisherId", "sellerId", "status", "stock", "title", "updatedAt", "views", "year" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalAmount" REAL NOT NULL,
    "commission" REAL NOT NULL,
    "sellerPayout" REAL NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'stripe',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "stripePaymentIntent" TEXT,
    "shippingAddress" TEXT NOT NULL DEFAULT '{}',
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "trackingNumber" TEXT,
    "courierService" TEXT,
    "notes" TEXT,
    "disputeReason" TEXT,
    "adminResolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("buyerId", "commission", "courierService", "createdAt", "deliveredAt", "disputeReason", "id", "notes", "paidAt", "paymentMethod", "paymentStatus", "sellerId", "sellerPayout", "shippedAt", "shippingAddress", "status", "totalAmount", "trackingNumber", "updatedAt") SELECT "buyerId", "commission", "courierService", "createdAt", "deliveredAt", "disputeReason", "id", "notes", "paidAt", "paymentMethod", "paymentStatus", "sellerId", "sellerPayout", "shippedAt", "shippingAddress", "status", "totalAmount", "trackingNumber", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
