export async function getSystemInfo(): Promise<ISystemInfo> {
  return window.systemAPI.systemInfo();
}
