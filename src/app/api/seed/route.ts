import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: "admin@profilballers.ci" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        user: {
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await db.user.create({
      data: {
        email: "admin@profilballers.ci",
        password: hashedPassword,
        name: "Admin profilballers.ci",
        role: "admin",
      },
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error seeding admin:", error);
    return NextResponse.json(
      { error: "Error creating admin user" },
      { status: 500 }
    );
  }
}
