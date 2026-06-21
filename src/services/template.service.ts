import { connectDB } from "@/lib/db";
import { InvoiceTemplate, IInvoiceTemplate } from "@/models/InvoiceTemplate";
import { Invoice } from "@/models/Invoice";

async function seedDefaultTemplates() {
  const defaults = [
    {
      name: "Classic Indigo",
      primaryColor: "#4F46E5",
      layoutType: "default",
    },
    {
      name: "Modern Teal",
      primaryColor: "#0D9488",
      layoutType: "modern",
    },
    {
      name: "Minimal Charcoal",
      primaryColor: "#27272A",
      layoutType: "minimal",
    },
  ];
  
  await InvoiceTemplate.insertMany(defaults);
  console.log("✅ Seeded 3 default invoice templates into database");
}

export async function getTemplates(companyId: string): Promise<IInvoiceTemplate[]> {
  await connectDB();
  
  // Seed defaults if they don't exist yet
  const defaultsCount = await InvoiceTemplate.countDocuments({
    $or: [{ companyId: null }, { companyId: { $exists: false } }],
  });
  
  if (defaultsCount === 0) {
    await seedDefaultTemplates();
  }

  return InvoiceTemplate.find({
    $or: [
      { companyId },
      { companyId: null },
      { companyId: { $exists: false } },
    ],
  }).sort({ createdAt: 1 });
}

export async function createTemplate(
  companyId: string,
  data: {
    name: string;
    primaryColor: string;
    layoutType: "default" | "modern" | "minimal";
  }
): Promise<IInvoiceTemplate> {
  await connectDB();
  const template = new InvoiceTemplate({
    companyId,
    name: data.name.trim(),
    primaryColor: data.primaryColor.trim(),
    layoutType: data.layoutType,
  });
  return template.save();
}

export async function updateTemplate(
  companyId: string,
  id: string,
  data: {
    name?: string;
    primaryColor?: string;
    layoutType?: "default" | "modern" | "minimal";
  }
): Promise<IInvoiceTemplate | null> {
  await connectDB();
  
  const template = await InvoiceTemplate.findById(id);
  if (!template) {
    throw new Error("TemplateNotFound");
  }
  
  if (!template.companyId) {
    throw new Error("TemplateReadOnly: System templates are read-only");
  }
  
  if (template.companyId.toString() !== companyId.toString()) {
    throw new Error("Unauthorized");
  }

  const updates: any = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.primaryColor !== undefined) updates.primaryColor = data.primaryColor.trim();
  if (data.layoutType !== undefined) updates.layoutType = data.layoutType;

  return InvoiceTemplate.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

export async function deleteTemplate(companyId: string, id: string): Promise<void> {
  await connectDB();
  
  const template = await InvoiceTemplate.findById(id);
  if (!template) {
    throw new Error("TemplateNotFound");
  }
  
  if (!template.companyId) {
    throw new Error("TemplateReadOnly: System templates cannot be deleted");
  }
  
  if (template.companyId.toString() !== companyId.toString()) {
    throw new Error("Unauthorized");
  }

  // Check if any invoices reference this template
  const invoicesCount = await Invoice.countDocuments({ templateId: id });
  if (invoicesCount > 0) {
    throw new Error("TemplateInUse: Cannot delete template because it is referenced by existing invoices.");
  }

  await InvoiceTemplate.findByIdAndDelete(id);
}
