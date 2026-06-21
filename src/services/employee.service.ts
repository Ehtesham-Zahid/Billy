import { connectDB } from "@/lib/db";
import { Employee, IEmployee } from "@/models/Employee";
import { Payroll } from "@/models/Payroll";

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
  const employee = new Employee({
    ...data,
    companyId,
  });
  return employee.save();
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
