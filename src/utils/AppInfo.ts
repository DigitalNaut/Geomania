export function isDev() : boolean {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
}

const AppInfo = {
  isInDevelopment: isDev
}

export default AppInfo;