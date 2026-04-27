import { supabase } from "@/integrations/supabase/client";

// In-memory 2FA codes (for demo - use proper email in production)
const twoFACodes = new Map<string, { code: string; timestamp: number; type: string; amount: number }>();

export async function generate2FACode(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function send2FACode(
  email: string,
  type: "transfer" | "withdrawal",
  amount: number
): Promise<string> {
  const code = await generate2FACode();
  const timestamp = Date.now();

  twoFACodes.set(email, { code, timestamp, type, amount });

  // In production, send via email service (SendGrid, etc)
  console.log(`[2FA] Code for ${email}: ${code} (${type}, R${amount})`);

  // Mock: Return for demo purposes (REMOVE IN PRODUCTION)
  return code;
}

export function verify2FACode(email: string, code: string): boolean {
  const stored = twoFACodes.get(email);
  if (!stored) return false;

  // 10 minute expiry
  if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
    twoFACodes.delete(email);
    return false;
  }

  if (stored.code !== code) return false;

  twoFACodes.delete(email);
  return true;
}

export async function createTransferWith2FA(
  userId: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number
): Promise<{ transferId: string; code: string }> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.email) throw new Error("No email found");

  // Create transfer record
  const { data, error } = await supabase
    .from("transfers")
    .insert({
      user_id: userId,
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount,
      status: "pending_2fa",
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;

  // Send 2FA code
  const code = await send2FACode(user.user.email, "transfer", amount);

  return { transferId: data[0].id, code };
}

export async function confirmTransferWith2FA(
  transferId: string,
  code: string
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.email) throw new Error("No email found");

  if (!verify2FACode(user.user.email, code)) {
    throw new Error("Invalid or expired 2FA code");
  }

  // Mark transfer as confirmed
  const { error } = await supabase
    .from("transfers")
    .update({ status: "confirmed", two_fa_verified_at: new Date().toISOString() })
    .eq("id", transferId);

  if (error) throw error;
}

export async function getOrCreateWalletAccount(userId: string) {
  let { data, error } = await supabase
    .from("wallet_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    const { data: newWallet, error: createError } = await supabase
      .from("wallet_accounts")
      .insert({ user_id: userId, balance: 0, currency: "ZAR" })
      .select()
      .single();

    if (createError) throw createError;
    return newWallet;
  }

  return data;
}

export async function addFundsToWallet(userId: string, amount: number) {
  const wallet = await getOrCreateWalletAccount(userId);

  const { error } = await supabase
    .from("wallet_accounts")
    .update({ balance: wallet.balance + amount })
    .eq("id", wallet.id);

  if (error) throw error;
}
