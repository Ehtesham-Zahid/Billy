import { connectDB } from "@/lib/db";
import { Client, IClient } from "@/models/Client";

export async function getClients(companyId: string): Promise<IClient[]> {
  await connectDB();
  return Client.find({ companyId }).sort({ createdAt: -1 });
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
