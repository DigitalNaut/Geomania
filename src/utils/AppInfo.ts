const AppInfo = {
  isDev: (): boolean => !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
}

export default AppInfo;