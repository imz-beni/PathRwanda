// Where people can reach whoever runs this copy of PathRwanda. Set SUPPORT_EMAIL on the server;
// without it, pages fall back to plain wording instead of showing a made-up address.
export function supportEmail(): string | null {
  const value = process.env.SUPPORT_EMAIL?.trim();
  return value && value.includes("@") ? value : null;
}
