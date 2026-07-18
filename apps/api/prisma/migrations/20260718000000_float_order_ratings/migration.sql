PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderTime" DATETIME NOT NULL,
    "mealTime" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL,
    "disliked" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "imageUrl" TEXT,
    "rawText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("id", "userId", "storeId", "orderTime", "mealTime", "category", "total", "deliveryFee", "rating", "disliked", "note", "imageUrl", "rawText", "createdAt", "updatedAt")
SELECT "id", "userId", "storeId", "orderTime", "mealTime", "category", "total", "deliveryFee", CAST("rating" AS REAL), "disliked", "note", "imageUrl", "rawText", "createdAt", "updatedAt" FROM "Order";

CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "dishId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "priceSnapshot" REAL NOT NULL,
    "rating" REAL,
    "disliked" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "orderId", "dishId", "nameSnapshot", "priceSnapshot", "rating", "disliked", "note")
SELECT "id", "orderId", "dishId", "nameSnapshot", "priceSnapshot", CASE WHEN "rating" IS NULL THEN NULL ELSE CAST("rating" AS REAL) END, "disliked", "note" FROM "OrderItem";

CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "dishId" TEXT,
    "orderId" TEXT,
    "targetType" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "disliked" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("id", "userId", "storeId", "dishId", "orderId", "targetType", "rating", "disliked", "content", "createdAt", "updatedAt")
SELECT "id", "userId", "storeId", "dishId", "orderId", "targetType", CAST("rating" AS REAL), "disliked", "content", "createdAt", "updatedAt" FROM "Review";

DROP TABLE "Review";
DROP TABLE "OrderItem";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
ALTER TABLE "new_Review" RENAME TO "Review";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;