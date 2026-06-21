import { connectDB } from "@/lib/db";
import { Client, IClient } from "@/models/Client";
import { Invoice } from "@/models/Invoice";

export async function getClients(companyId: string): Promise<any[]> {
  await connectDB();
  const clients = await Client.find({ companyId }).sort({ createdAt: -1 });

  const clientsWithInvoiced = await Promise.all(
    clients.map(async (client) => {
      const invoices = await Invoice.find({
        companyId,
        clientId: client._id,
        status: { $ne: "draft" },
      });
      const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      return {
        ...client.toObject(),
        totalInvoiced,
      };
    })
  );

  return clientsWithInvoiced;
}

export async function createClient(companyId: string, data: Partial<IClient>): Promise<IClient> {
  await connectDB();
  const client = new Client({
    ...data,
    companyId,
  });
  return client.save();
}

export async function getClientById(companyId: string, id: string): Promise<IClient | null> {
  await connectDB();
  return Client.findOne({ _id: id, companyId });
}

export async function updateClient(companyId: string, id: string, data: Partial<IClient>): Promise<IClient | null> {
  await connectDB();
  return Client.findOneAndUpdate(
    { _id: id, companyId },
    { $set: data },
    { new: true, runValidators: true }
  );
}

export async function deleteClient(companyId: string, id: string): Promise<IClient | null> {
  await connectDB();
  return Client.findOneAndDelete({ _id: id, companyId });
}
