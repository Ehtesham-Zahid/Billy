import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Employee, IEmployee } from "@/models/Employee";
import { Payroll } from "@/models/Payroll";
import { Company } from "@/models/Company";

export async function getEmployees(
  companyId: string,
  department?: string
): Promise<IEmployee[]> {
  await connectDB();
  const query: any = { companyId };
  if (department && department !== "all") {
    query.department = department;
  }
  return Employee.find(query).sort({ createdAt: -1 });
}

export async function createEmployee(
  companyId: string,
  data: Partial<IEmployee>
): Promise<IEmployee> {
  await connectDB();
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const employee = new Employee({
    ...data,
    companyId,
    inviteToken,
  });
  const savedEmployee = await employee.save();

  // Asynchronously dispatch the email without blocking employee creation return
  (async () => {
    try {
      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailPass) {
        console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not defined. Skipping automatic invite email.");
        return;
      }

      const company = await Company.findById(companyId);
      const companyName = company ? company.name : "Your Company";
      const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appBaseUrl}/invite/${inviteToken}`;

      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: gmailUser,
        to: savedEmployee.email,
        subject: `Invitation to join ${companyName} on Billy`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
            <h2 style="color: #7c3aed; margin-bottom: 16px;">Welcome to Billy</h2>
            <p>You have been added as an employee at <strong>${companyName}</strong> on Billy.</p>
            <p>Click the button below to set up your account and view your salary details:</p>
            <div style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Set Up Account</a>
            </div>
            <p style="font-size: 12px; color: #71717a; margin-top: 24px;">
              If the button doesn't work, copy and paste this link in your browser:<br/>
              <a href="${inviteUrl}" style="color: #7c3aed;">${inviteUrl}</a>
            </p>
          </div>
        `,
      });
      console.log(`Successfully sent invite email to ${savedEmployee.email} via Gmail SMTP`);
    } catch (emailErr) {
      console.error("Failed to send invite email to employee:", emailErr);
    }
  })();

  return savedEmployee;
}

export async function getEmployeeById(
  companyId: string,
  id: string
): Promise<IEmployee | null> {
  await connectDB();
  return Employee.findOne({ _id: id, companyId });
}

export async function updateEmployee(
  companyId: string,
  id: string,
  data: Partial<IEmployee>
): Promise<IEmployee | null> {
  await connectDB();
  return Employee.findOneAndUpdate(
    { _id: id, companyId },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function deleteEmployee(
  companyId: string,
  id: string
): Promise<IEmployee | null> {
  await connectDB();
  
  // Block deletion if employee has payroll history
  const payrollCount = await Payroll.countDocuments({ employeeId: id });
  if (payrollCount > 0) {
    throw new Error("Cannot delete employee with payroll history. Mark them as inactive instead.");
  }
  
  return Employee.findOneAndDelete({ _id: id, companyId });
}
