-- CreateEnum
CREATE TYPE "Role" AS ENUM ('coordinador', 'encargado');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('equipo', 'reactivo', 'consumible', 'material');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('activo', 'mantenimiento', 'baja', 'agotado');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('text', 'number', 'date', 'select', 'url');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('creado', 'editado', 'status_cambiado', 'dado_de_baja', 'imagen_actualizada');

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'encargado',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabMember" (
    "userId" INTEGER NOT NULL,
    "labId" INTEGER NOT NULL,

    CONSTRAINT "LabMember_pkey" PRIMARY KEY ("userId","labId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'activo',
    "imageUrl" TEXT,
    "extraFields" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unit" TEXT,
    "createdById" INTEGER,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "oldStatus" "Status" NOT NULL,
    "newStatus" "Status" NOT NULL,
    "reason" TEXT,
    "changedById" INTEGER NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLog" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "periodo" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabFieldSchema" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL DEFAULT 'text',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisibleInTable" BOOLEAN NOT NULL DEFAULT true,
    "isFilterable" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "selectOptions" JSONB,

    CONSTRAINT "LabFieldSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAuditLog" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "AuditAction" NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Laboratory_name_key" ON "Laboratory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LabFieldSchema_labId_fieldKey_key" ON "LabFieldSchema"("labId", "fieldKey");

-- AddForeignKey
ALTER TABLE "Laboratory" ADD CONSTRAINT "Laboratory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabMember" ADD CONSTRAINT "LabMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabMember" ADD CONSTRAINT "LabMember_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Laboratory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLog" ADD CONSTRAINT "AssetLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabFieldSchema" ADD CONSTRAINT "LabFieldSchema_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Laboratory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAuditLog" ADD CONSTRAINT "AssetAuditLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAuditLog" ADD CONSTRAINT "AssetAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
